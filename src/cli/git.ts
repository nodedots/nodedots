import { spawn } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import { resolve, relative, isAbsolute, dirname } from "node:path";
import { checkEligible, MAX_FILE_BYTES, MAX_CHANGED_FILES } from "@/engine/eligibility";
import type { AnalysisInput } from "@/engine/types";
import { CliError, type Options } from "./options";
const MAX_FILES = 10000, MAX_BYTES = 100000000, MAX_GIT_OUTPUT = 104000000;
type Entry = {
    mode: string;
    oid: string;
};
type Inventory = Map<string, Entry>;
async function rawGit(cwd: string, args: string[], input?: string, limit = 4000000): Promise<Buffer> {
    return new Promise((accept, reject) => {
        const child = spawn("git", ["--no-pager", "-c", "core.fsmonitor=false", ...args], { cwd, shell: false, windowsHide: true, env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_OPTIONAL_LOCKS: "0", GIT_NO_LAZY_FETCH: "1" } });
        const chunks: Buffer[] = [];
        let bytes = 0, failed = false;
        const timer = setTimeout(() => { failed = true; child.kill(); reject(new CliError("Git timed out. Check the repository and retry.")); }, 60000);
        child.stdout.on("data", (data: Buffer) => { bytes += data.length; if (bytes > limit) {
            failed = true;
            child.kill();
            reject(new CliError("Git output exceeds the local inventory budget."));
        }
        else
            chunks.push(data); });
        // Upstream stderr can contain remote URLs or credentials; never echo it.
        child.stderr.resume();
        child.stdin.on("error", () => { });
        child.on("error", () => { clearTimeout(timer); reject(new CliError("Git could not start. Install Git and use an accessible repository.")); });
        child.on("close", code => { clearTimeout(timer); if (failed)
            return; if (code !== 0)
            reject(new CliError(`Git ${args[0]} failed. Check refs, repository access, and local object availability.`));
        else
            accept(Buffer.concat(chunks)); });
        child.stdin.end(input);
    });
}
export async function git(cwd: string, args: string[], input?: string, limit = 4000000) {
    const keys = (await rawGit(cwd, ["config", "--null", "--list", "--name-only"])).toString("utf8").split("\0");
    const filters = new Set(keys.flatMap(key => { const match = /^filter\.(.+)\.(clean|smudge|process|required)$/i.exec(key); return match ? [match[1]] : []; }));
    const overrides = [...filters].flatMap(name => ["-c", `filter.${name}.clean=`, "-c", `filter.${name}.smudge=`, "-c", `filter.${name}.process=`, "-c", `filter.${name}.required=false`]);
    return rawGit(cwd, [...overrides, ...args], input, limit);
}
function text(data: Buffer) { try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
}
catch {
    throw new CliError("A Git filename or file is not valid UTF-8.");
} }
function paths(data: Buffer) { return text(data).split("\0").filter(Boolean); }
function safePath(path: string) { if (!path || path.includes("\0") || path.includes("\\") || isAbsolute(path) || path.split("/").some(p => p === ".." || p === "."))
    throw new CliError("An unsafe repository path was rejected."); return path; }
async function commit(root: string, ref: string) { const oid = text(await git(root, ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`])).trim(); if (!/^[a-f0-9]{40,64}$/.test(oid))
    throw new CliError("Could not resolve the requested commit."); return oid; }
async function tree(root: string, oid: string) { const entries: Inventory = new Map(); for (const row of paths(await git(root, ["ls-tree", "-r", "-z", "--full-tree", oid]))) {
    const split = row.indexOf("\t"), [mode, , object] = row.slice(0, split).split(" ");
    if (split < 0 || !/^[a-f0-9]{40,64}$/.test(object))
        throw new CliError("Invalid Git tree inventory.");
    entries.set(safePath(row.slice(split + 1)), { mode, oid: object });
} return entries; }
async function index(root: string) { const entries: Inventory = new Map(); for (const row of paths(await git(root, ["ls-files", "--stage", "-z"]))) {
    const split = row.indexOf("\t"), [mode, oid, stage] = row.slice(0, split).split(" ");
    if (stage !== "0")
        throw new CliError("Resolve merge conflicts before running Pre-flight.");
    if (split < 0 || !/^[a-f0-9]{40,64}$/.test(oid))
        throw new CliError("Invalid Git index inventory.");
    entries.set(safePath(row.slice(split + 1)), { mode, oid });
} return entries; }
function eligible(path: string, example: string) { const basename = path.split("/").pop()!; if ((basename.startsWith(".env") && !/^(\.env\.example|\.env\.sample)$/.test(basename)) || basename.startsWith(".dev.vars") || /\.(pem|key|pfx|p12)$/i.test(path))
    return "private configuration or credential file"; const check = checkEligible(path, 0); if (!check.eligible)
    return check.reason!; return /\.(tsx?|jsx?|mjs|cjs|prisma)$/i.test(path) || path === example || /^(\.env\.example|\.env\.sample)$/.test(basename) ? null : "outside supported source scope"; }
async function blobs(root: string, entries: Inventory) {
    const objects = [...new Set([...entries.values()].filter(e => /^100(644|755)$/.test(e.mode)).map(e => e.oid))], result = new Map<string, Buffer>();
    if (!objects.length)
        return result;
    const sizes = text(await git(root, ["cat-file", "--batch-check"], objects.join("\n") + "\n")).trim().split("\n");
    let total = 0;
    const selected: string[] = [];
    for (const line of sizes) {
        const [oid, type, sizeText] = line.split(" "), size = Number(sizeText);
        if (type !== "blob" || !Number.isSafeInteger(size) || size < 0)
            throw new CliError("A required Git blob is unavailable. Fetch the required history first.");
        if (size > MAX_FILE_BYTES || total + size > MAX_BYTES)
            continue;
        total += size;
        selected.push(oid);
    }
    if (!selected.length)
        return result;
    const output = await git(root, ["cat-file", "--batch"], selected.join("\n") + "\n", MAX_GIT_OUTPUT);
    let offset = 0;
    for (const expected of selected) {
        const end = output.indexOf(10, offset);
        if (end < 0)
            throw new CliError("Invalid Git blob response.");
        const [oid, type, sizeText] = output.subarray(offset, end).toString("ascii").split(" "), size = Number(sizeText);
        offset = end + 1;
        if (oid !== expected || type !== "blob" || !Number.isSafeInteger(size) || size < 0 || offset + size >= output.length)
            throw new CliError("Invalid Git blob response.");
        result.set(oid, output.subarray(offset, offset + size));
        offset += size + 1;
    }
    return result;
}
function decode(data: Buffer) { if (data.includes(0))
    return null; try {
    return new TextDecoder("utf-8", { fatal: true }).decode(data);
}
catch {
    return null;
} }
async function localFile(root: string, path: string) {
    const absolute = resolve(root, path), rel = relative(root, absolute);
    if (isAbsolute(rel) || rel.startsWith(".."))
        throw new CliError("Path outside the repository was rejected.");
    // Reject symlinks/junctions in every path component, including parent folders.
    let cursor = absolute;
    while (cursor !== root) {
        try {
            if ((await lstat(cursor)).isSymbolicLink())
                return { skip: "symlink or linked directory" };
        }
        catch (error) {
            if ((error as NodeJS.ErrnoException).code === "ENOENT")
                return { missing: true };
            throw new CliError("A source path could not be inspected.");
        }
        cursor = dirname(cursor);
    }
    const before = await lstat(absolute);
    if (!before.isFile())
        return { skip: "not a regular file" };
    if (before.size > MAX_FILE_BYTES)
        return { skip: "exceeds 1 MB file limit" };
    const data = await readFile(absolute), after = await lstat(absolute);
    if (before.mtimeMs !== after.mtimeMs || before.size !== after.size || before.ino !== after.ino)
        throw new CliError("Local files changed during the check. Stop editing and retry.");
    return { data, stamp: `${after.ino}:${after.size}:${after.mtimeMs}` };
}
export async function snapshot(options: Options) {
    let root: string;
    try {
        root = await realpath(text(await git(options.cwd, ["rev-parse", "--show-toplevel"])).trim());
    }
    catch {
        throw new CliError("Choose an accessible Git repository with --cwd.");
    }
    const base = await commit(root, options.base), head = options.head ? await commit(root, options.head) : null;
    const baseTree = await tree(root, base), indexTree = head ? null : await index(root), headTree = head ? await tree(root, head) : new Map(indexTree!);
    const changed = new Set([...new Set([...baseTree.keys(), ...headTree.keys()])].filter(path => baseTree.get(path)?.oid !== headTree.get(path)?.oid || baseTree.get(path)?.mode !== headTree.get(path)?.mode));
    // Avoid git diff on local content: custom clean filters could execute code.
    if (!head && !options.staged)
        for (const path of paths(await git(root, ["ls-files", "--modified", "--deleted", "-z"])))
            changed.add(safePath(path));
    if (options.includeUntracked)
        for (const path of paths(await git(root, ["ls-files", "--others", "--exclude-standard", "-z"]))) {
            safePath(path);
            changed.add(path);
            headTree.set(path, { mode: "100644", oid: "" });
        }
    const input: AnalysisInput = { files: [], changes: [], exampleEnvPath: options.envExample, retrievalNotes: { skipped: [], truncation: [], forkPartial: null } };
    const skipped = input.retrievalNotes!.skipped;
    const candidates = [...new Set([...changed, ...headTree.keys()])].filter(p => !eligible(p, options.envExample));
    const selected = new Set(candidates.slice(0, MAX_FILES));
    if (candidates.length > MAX_FILES)
        input.retrievalNotes!.truncation.push(`Local inventory capped at ${MAX_FILES} files.`);
    if (changed.size > MAX_CHANGED_FILES)
        input.retrievalNotes!.truncation.push(`Changed-file inventory exceeds ${MAX_CHANGED_FILES}; remaining changed files are not analyzed.`);
    const changedSelected = [...changed].slice(0, MAX_CHANGED_FILES);
    const wanted: Inventory = new Map();
    for (const p of selected) {
        const e = headTree.get(p);
        if (e && e.oid && (head || options.staged))
            wanted.set(`head:${p}`, e);
        if (changed.has(p)) {
            const old = baseTree.get(p);
            if (old)
                wanted.set(`base:${p}`, old);
        }
    }
    const content = await blobs(root, wanted), stamps = new Map<string, string>();
    let localBytes = 0;
    for (const path of new Set([...selected, ...changedSelected])) {
        const excluded = eligible(path, options.envExample);
        if (excluded) {
            if (changed.has(path))
                skipped.push({ path, reason: excluded });
            continue;
        }
        if (!selected.has(path)) {
            skipped.push({ path, reason: "local inventory budget" });
            continue;
        }
        const old = baseTree.get(path), current = headTree.get(path);
        let before: string | null = null, after: string | null = null;
        let reason: string | null = null;
        if (changed.has(path) && old) {
            const data = content.get(old.oid);
            before = data ? decode(data) : null;
            if (before === null)
                reason = "base blob skipped: linked path, binary, or retrieval budget";
        }
        if (current) {
            if (!/^100(644|755)$/.test(current.mode))
                reason = "symlink, submodule, or unsupported file mode";
            else if (head || options.staged) {
                const data = content.get(current.oid);
                after = data ? decode(data) : null;
                if (after === null)
                    reason = "head blob skipped: binary or retrieval budget";
            }
            else {
                const local = await localFile(root, path);
                if (local.skip)
                    reason = local.skip;
                else if (local.data) {
                    localBytes += local.data.length;
                    if (localBytes > MAX_BYTES)
                        reason = "working-tree byte budget";
                    else {
                        after = decode(local.data);
                        if (after === null)
                            reason = "binary or invalid UTF-8 source";
                        if (local.stamp)
                            stamps.set(path, local.stamp);
                    }
                }
            }
        }
        if (reason) {
            skipped.push({ path, reason });
            continue;
        }
        if (!head && !options.staged && changed.has(path) && before !== null && after !== null && before.replace(/\r\n/g, "\n") === after.replace(/\r\n/g, "\n") && old?.mode === current?.mode)
            changed.delete(path);
        if (changed.has(path) && changedSelected.includes(path))
            input.changes.push({ path, base: before, head: after });
        else if (after !== null)
            input.files.push({ path, content: after });
    }
    if (!head && !options.staged) {
        for (const [path, stamp] of stamps) {
            const stat = await lstat(resolve(root, path));
            if (`${stat.ino}:${stat.size}:${stat.mtimeMs}` !== stamp)
                throw new CliError("Local files changed during the check. Retry with a stable working tree.");
        }
    }
    if (indexTree) {
        const latest = await index(root);
        if (JSON.stringify([...latest]) !== JSON.stringify([...indexTree]))
            throw new CliError("The Git index changed during the check. Retry.");
    }
    return { input, metadata: { schemaVersion: 1, base, head: head ?? (options.staged ? "index" : "working-tree"), mode: head ? "commits" : options.staged ? "staged" : "working-tree", selectedChanges: changed.size, analyzedChanges: input.changes.length, includesUntracked: options.includeUntracked } };
}
