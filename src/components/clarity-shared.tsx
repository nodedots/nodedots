import { Header } from "./navigation/header";
import { Footer } from "./navigation/footer";
import { StateDot, type DotState } from "./state-dot";
import { WaitlistForm } from "./waitlist-form";
import { CliCommand } from "./cli-command";
import { clarityDescription, clarityHeadlineLines, clarityTrust } from "@/lib/marketing-copy";
export function ClarityHeader({ compact = false }: { compact?: boolean; external?: boolean }) { return <Header reduced={compact} />; }
export function ProductActions() {
  return <div className="clarity-product-actions"><a className="clarity-start-button" href="/onboarding">Get Started</a><a className="clarity-docs-button" href="/doc">Read the Docs</a></div>;
}
export function ClarityHero({ compact = false }: { compact?: boolean }) {
  return <section className="clarity-hero" aria-labelledby="hero-title"><p className="clarity-eyebrow"><span className="availability-dot" />For GitHub pull requests</p><h1 id="hero-title"><span className="clarity-headline-line">{clarityHeadlineLines[0]}</span>{" "}<span className="clarity-headline-line">{clarityHeadlineLines[1]}</span></h1><p className="clarity-lead">{clarityDescription}</p><p className="clarity-result">An impact report for developers and teams, right on the pull request.</p>{compact ? <><div className="wl-signup clarity-signup" id="join"><WaitlistForm idPrefix="early-access" /></div><p className="clarity-trust">{clarityTrust}</p></> : <><ProductActions /><p className="clarity-preview-note">Connect GitHub. Choose a repository. Review your first pull request.</p><CliCommand /></>}
    {compact && <div className="clarity-hero-links"><a className="clarity-example-link" href="#connected">See an example <span aria-hidden="true">↓</span></a></div>}</section>;
}
const legend: [DotState, string, string][] = [["confirmed", "Confirmed", "checks out"], ["missing", "Missing", "expected but absent"], ["conflicting", "Conflicting", "two parts disagree"], ["uncertain", "Uncertain", "not enough evidence"], ["action", "Action required", "needs your decision"]];
export function FindingLegend() {
  return <ul className="clarity-legend" aria-label="Finding states and their meanings">{legend.map(([state, label, meaning]) => <li key={state}><StateDot state={state} /><span>{label}<small>{meaning}</small></span></li>)}</ul>;
}
export function ClarityFooter() { return <Footer />; }
