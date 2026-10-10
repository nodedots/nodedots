import { analyze } from "@/engine";
import { findings } from "@/workspace/model";
import type { ImpactReport } from "@/engine/types";
import { snapshot } from "./git";
import { CliError, help, parseOptions, type Options } from "./options";
export const version = "0.1.0";
export function exitCode(report: ImpactReport, options: Options) {
    if (options.requireFull && (report.coverage.completeness !== "full" || report.coverage.totalCandidates > report.coverage.publishedFindings))
        return 3;
    const rank = { high: 0, medium: 1, low: 2 };
    return options.failOn !== "none" && findings(report).some(f => f.state !== "UNCERTAIN" && rank[f.severity] <= rank[options.failOn as "high" | "medium" | "low"]) ? 1 : 0;
}
function clean(value: string) { return value.replace(/[\u0000-\u001f\u007f-\u009f]/g, " "); }
export async function run(args: string[], cwd: string, stdout: (text: string) => void, stderr: (text: string) => void) {
    if (args.includes("--help") || args.length === 0) {
        stdout(help);
        return 0;
    }
    if (args.length === 1 && args[0] === "--version") {
        stdout(`nodedots ${version}\n`);
        return 0;
    }
    try {
        const options = parseOptions(args, cwd), { input, metadata } = await snapshot(options), report = await analyze(input, { enrichment: false });
        if (metadata.selectedChanges > 0 && input.changes.length === 0)
            report.coverage.completeness = "unsupported";
        if (input.retrievalNotes!.truncation.length && report.coverage.completeness === "full")
            report.coverage.completeness = "partial";
        const code = exitCode(report, options), result = { ...metadata, cliVersion: version, advisory: true, exitCode: code, report };
        if (options.format === "json")
            stdout(JSON.stringify(result, null, 2) + "\n");
        else {
            const lines = [`NodeDots Pre-flight · ${metadata.mode}`, `Base: ${metadata.base} · Head: ${metadata.head}`, `${metadata.selectedChanges} selected changes · ${report.coverage.analyzedFiles} files examined · ${report.coverage.completeness} coverage`, ""];
            if (!metadata.selectedChanges)
                lines.push("No changes selected.");
            else if (!findings(report).length)
                lines.push("No observations in the checked scope. This does not establish safety.");
            for (const f of findings(report)) {
                lines.push(`${f.severity.toUpperCase()} · ${f.state} · ${clean(f.title)}`, clean(f.explanation), ...f.evidence.map(e => `  ${clean(e.path)}:${e.startLine}${e.baseSide ? " (base)" : ""} · ${clean(e.note)}`), `Next: ${clean(f.nextStep)}`, "");
            }
            for (const skip of report.coverage.skippedFiles)
                lines.push(`Skipped: ${clean(skip.path)} · ${clean(skip.reason)}`);
            for (const note of report.coverage.notes)
                lines.push(`Coverage: ${clean(note)}`);
            for (const unknown of report.unknown)
                lines.push(`Unknown: ${clean(unknown.detail)}`);
            lines.push("", `Policy: fail-on ${options.failOn}; require-full ${options.requireFull}; exit ${code}`, "Advisory static analysis. Keep tests and human review. Source stays local.");
            stdout(lines.join("\n") + "\n");
        }
        return code;
    }
    catch (error) {
        stderr(`NodeDots: ${clean(error instanceof CliError ? error.message : "The local check failed. Check repository access and retry.")}\n`);
        return 2;
    }
}
