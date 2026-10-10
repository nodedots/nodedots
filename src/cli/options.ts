export class CliError extends Error {
}
export type Options = {
    cwd: string;
    base: string;
    head?: string;
    staged: boolean;
    includeUntracked: boolean;
    format: "text" | "json";
    failOn: "none" | "high" | "medium" | "low";
    requireFull: boolean;
    envExample: string;
};
export const help = `NodeDots Pre-flight CLI · source preview

Usage: nodedots check [options]

  --cwd PATH            Repository directory (default: current directory)
  --base REF            Base commit/ref (default: HEAD; direct comparison)
  --head REF            Compare committed snapshots instead of local files
  --staged              Analyze the index; ignore unstaged file contents
  --include-untracked   Include non-ignored untracked files in working-tree mode
  --format text|json    Report on stdout (default: text)
  --fail-on LEVEL       none, high, medium, low (default: none / advisory)
  --require-full        Exit 3 for incomplete scope or withheld findings
  --env-example PATH    Repository-relative inventory (default: .env.example)
  --help                Show usage
  --version             Show CLI version

Exit codes: 0 = policy passed; 1 = finding threshold reached;
            2 = input/runtime error; 3 = required coverage incomplete.
Reads Git/source locally. No upload, code execution, fixes, or automatic hooks.
`;
export function parseOptions(args: string[], cwd: string): Options {
    if (args[0] !== "check")
        throw new CliError("Use ‘nodedots check’. Run with --help for options.");
    const options: Options = { cwd, base: "HEAD", staged: false, includeUntracked: false, format: "text", failOn: "none", requireFull: false, envExample: ".env.example" };
    const flags = new Set<string>();
    for (let i = 1; i < args.length; i++) {
        const flag = args[i];
        if (flags.has(flag))
            throw new CliError(`Repeated option: ${flag}`);
        flags.add(flag);
        if (["--staged", "--include-untracked", "--require-full"].includes(flag)) {
            if (flag === "--staged")
                options.staged = true;
            else if (flag === "--include-untracked")
                options.includeUntracked = true;
            else
                options.requireFull = true;
            continue;
        }
        if (!["--cwd", "--base", "--head", "--format", "--fail-on", "--env-example"].includes(flag))
            throw new CliError(`Unknown option: ${flag}`);
        const value = args[++i];
        if (!value || value.startsWith("--") || value.includes("\0"))
            throw new CliError(`Missing or invalid value for ${flag}.`);
        if (flag === "--cwd")
            options.cwd = value;
        else if (flag === "--base")
            options.base = value;
        else if (flag === "--head")
            options.head = value;
        else if (flag === "--env-example")
            options.envExample = value;
        else if (flag === "--format") {
            if (!["text", "json"].includes(value))
                throw new CliError("Format must be text or json.");
            options.format = value as Options["format"];
        }
        else {
            if (!["none", "high", "medium", "low"].includes(value))
                throw new CliError("Failure threshold must be none, high, medium, or low.");
            options.failOn = value as Options["failOn"];
        }
    }
    if (options.head && options.staged)
        throw new CliError("--head and --staged select different snapshots; choose one.");
    if (options.includeUntracked && (options.staged || options.head))
        throw new CliError("--include-untracked is only available for working-tree checks.");
    if (options.envExample.startsWith("/") || options.envExample.includes("\\") || options.envExample.split("/").some(p => p === "..") || /^[a-z]:/i.test(options.envExample))
        throw new CliError("Environment inventory must be a repository-relative path.");
    return options;
}
