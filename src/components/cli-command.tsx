"use client";

import { useState } from "react";

const command = "npm run preflight -- --staged";

export function CliCommand() {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  }

  return <div className="clarity-cli">
    <div className="clarity-cli-caption"><span>Or check locally with Pre-flight</span><span className="clarity-cli-badge">Source preview</span></div>
    <div className="clarity-cli-command">
      <span className="clarity-cli-prompt" aria-hidden="true">$</span>
      <code>{command}</code>
      <button type="button" onClick={copy} aria-label="Copy Pre-flight CLI command">
        {status === "copied" ? <span aria-hidden="true">✓</span> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/></svg>}
      </button>
    </div>
    <p className="clarity-cli-help">Build from source first. <a href="/doc/pre-flight-cli">CLI setup →</a></p>
    <p className="clarity-cli-status" role="status">{status === "copied" ? "Command copied." : status === "error" ? "Copy unavailable. Select the command to copy it manually." : ""}</p>
  </div>;
}
