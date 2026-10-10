<p align="center">
  <img src="public/brand/x-cover.png" alt="NodeDots — Catch What Your Pull Request Missed. A clearer review before you merge." width="100%" />
</p>

<h1 align="center">NodeDots</h1>

<p align="center">
  <strong>Connect the dots before you act.</strong><br />
  Open-source change-impact analysis for code, contracts, configuration, and tests.
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-d5ef79?labelColor=1a1030" alt="License: Apache 2.0" /></a>
  <img src="https://img.shields.io/badge/status-development_preview-d5ef79?labelColor=1a1030" alt="Status: development preview" />
  <a href="src/engine"><img src="https://img.shields.io/badge/built_with-TypeScript-d5ef79?labelColor=1a1030" alt="Built with TypeScript" /></a>
  <a href="https://github.com/0x-Sigmoid/nodedots/stargazers"><img src="https://img.shields.io/github/stars/0x-Sigmoid/nodedots?style=flat&color=d5ef79&labelColor=1a1030" alt="GitHub stars" /></a>
</p>

<p align="center">
  <a href="https://nodedots.com">Website</a> ·
  <a href="https://nodedots.com/waitlist">Join the waitlist</a> ·
  <a href="https://nodedots.com/doc">Documentation</a> ·
  <a href="#quick-start">Quick start</a> ·
  <a href="#contributing">Contribute</a> ·
  <a href="https://x.com/nodedots">Follow on X</a>
</p>

---

## A small change can leave a big gap

You replace Firebase Auth with Clerk. Login works. Sessions work. The pull request looks ready.

But billing still looks up customers using a Firebase UID.

**NodeDots Code follows a change into the code around it.** It connects affected files, contracts, configuration, and tests, then turns supported findings into an inspectable report: what changed, what disagrees, what is missing, and what needs your attention before merging.

The goal is a clearer review, with evidence you can check.

## What is here today

This repository contains the NodeDots Code MVP and the public early-access site. The product is a **development preview**. The marketing demos are illustrative; they do not analyze visitor code.

| Area | Implemented in the repository |
| --- | --- |
| **Pre-flight CLI** | Local working-tree, staged, and commit checks with text/JSON evidence and optional failure policies. Source preview; [usage guide](packages/cli/README.md). |
| **Change-impact engine** | Static extraction, relationship traversal, and deterministic rules for supported TypeScript/JavaScript patterns. |
| **Inspectable reports** | Findings, source evidence, affected areas, coverage notes, and review checklists. |
| **GitHub ingestion** | Signed webhook verification, deduplication, commit-pinned snapshot retrieval, and check-run payloads. Live delivery needs configured credentials. |
| **Bounded enrichment** | Heuristic hypotheses and an optional OpenAI-compatible provider, filtered through evidence and confidence checks. |
| **Reviewer feedback** | Accept, dismiss, resolve, or mark a finding intentional, with persisted feedback events. |
| **Shipping workflow** | Repository readiness, shared shipping policy, change-intent briefs, real commit CI, release assessments, and permission-checked reviewer handoffs. See the [workflow guide](docs/workspace-workflow.md). |
| **Early-access site** | Marketing pages, interactive examples, a D1-backed waitlist, and configurable Resend confirmations. |
| **Account onboarding** | GitHub sign-in, selected-repository connection, and a manual review workspace. Requires registering and configuring a GitHub App; see the [setup guide](docs/onboarding-setup.md). |

### Five states. One connected view.

| State | Meaning |
| --- | --- |
| **Confirmed** | Supported evidence agrees. |
| **Missing** | An expected part is absent from the checked scope. |
| **Conflicting** | Connected parts disagree. |
| **Uncertain** | Evidence is incomplete or the conclusion needs verification. |
| **Action required** | A decision or follow-up is needed. |

Analysis is advisory. Partial or unsupported scope is reported explicitly. Live retrieval currently does not fetch every unchanged file, so findings cannot establish that a repository is safe. Keep tests and human review in the workflow.

## Check before you push

The local CLI shares the deterministic engine and needs no web server or GitHub connection. It is a source preview, not an npm release.

```sh
npm ci
npm run cli:build
npm run preflight -- --staged
node packages/cli/dist/nodedots.cjs check --cwd /path/to/repository
```

Use `--format json` for structured output, `--base REF --head REF` for commit comparisons, and optional `--fail-on high --require-full` policies. Read the [CLI guide](packages/cli/README.md) for installation, scope, and exit codes.

## How it works

```text
Pull request → Commit-pinned snapshot → Extracted relationships
                                            ↓
                              Rules + bounded enrichment
                                            ↓
                             Evidence → Findings → Checklist
```

Start with the [engine](src/engine), [GitHub pipeline](src/github), and [report viewer](src/reports). The [architecture](docs/07-system-architecture.md) and [evidence policy](docs/15-ai-safety-confidence-and-evidence-policy.md) explain the intended design and its boundaries.

## Quick start

Use **Node.js 22 or newer** and npm. Run these commands from a fresh clone:

```bash
git clone https://github.com/0x-Sigmoid/nodedots.git
cd nodedots
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) for the site and illustrative demos.

To explore fixture-backed product reports, add the following to a local `.env.local` file, then restart the development server:

```dotenv
PRODUCT_PREVIEW_ENABLED=1
```

Open [localhost:3000/reports](http://localhost:3000/reports). Fixture reports need no GitHub or AI-provider credentials. Keep the preview flag disabled on the public production deployment.

Local signup testing also requires the D1 migration:

```bash
npm run cf:db:local
```

GitHub ingestion, Postgres persistence, and email delivery require their own configuration. Follow the [development guide](docs/development.md) and [Cloudflare launch guide](docs/cloudflare-waitlist-launch.md) when enabling them.

## Built with

**Next.js · React · TypeScript · Tailwind CSS · Vitest**

The waitlist runs on **Cloudflare Workers + D1** through OpenNext. Product ingestion supports **Postgres** persistence; local report exploration uses built-in fixtures.

```text
src/engine/                 Extraction, graph traversal, and deterministic rules
src/ai/                     Hypotheses, provider integration, and evidence gates
src/github/                 Webhooks, snapshots, outbox, and check-run integration
src/reports/                Reports, storage, feedback, and preview gating
src/components/             Marketing, navigation, and report interfaces
src/db/                     SQL migrations and Postgres adapters
src/waitlist/               D1 signup storage and confirmation delivery
src/eval/                   Evaluation fixtures and regression checks
docs/                       Product direction, architecture, and operating guides
```

## What is next

The focus is useful, evidence-backed reviews of GitHub pull requests. The **pre-flight CLI**, **software memory**, and **architecture-drift workflows** are planned directions, not released features.

See the [roadmap](docs/21-product-roadmap.md) and [product vision](docs/01-product-vision-and-strategy.md). The 24 product documents include proposals and launch targets; they are not a list of capabilities already available.

There is no published `nodedots check` package to install yet. To follow the hosted product, [join the early-access waitlist](https://nodedots.com/waitlist).

## Contributing

Good starting points include a reproducible missed connection, a noisy finding, a small extraction rule, an accessibility improvement, or a clearer example.

1. [Open an issue](https://github.com/0x-Sigmoid/nodedots/issues) with the problem and expected behavior. Discuss larger changes before implementing them.
2. Work in a branch or fork. Keep changes focused and add an evaluation fixture when changing analysis behavior.
3. Run the relevant checks, then open a pull request explaining the change and how you verified it.

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

Use synthetic or public examples in issues and fixtures. Keep private repository content and credentials out of contributions. Original contributions submitted for inclusion follow the project's [Apache 2.0 licensing policy](docs/licensing.md).

If NodeDots is useful to you, **star the repository**, share a concrete review scenario, or [join the conversation on X](https://x.com/nodedots).

## Documentation

| Start here | Go deeper |
| --- | --- |
| [Product vision](docs/01-product-vision-and-strategy.md) | Why NodeDots exists and where Code fits. |
| [Development guide](docs/development.md) | Local ingestion, persistence, enrichment, and demo playback. |
| [Architecture](docs/07-system-architecture.md) | Intended system design and component responsibilities. |
| [Evidence policy](docs/15-ai-safety-confidence-and-evidence-policy.md) | Confidence, uncertainty, and limits on AI inference. |
| [Cloudflare launch guide](docs/cloudflare-waitlist-launch.md) | Workers, D1, DNS, and signup confirmations. |
| [Full documentation index](docs/README.md) | All 24 product and engineering documents. |

## License

Original NodeDots code and documentation are licensed under **[Apache License 2.0](LICENSE)** unless explicitly identified otherwise. See [NOTICE](NOTICE) and the [licensing policy](docs/licensing.md).

Commercial use, modification, and redistribution are permitted, including commercial forks and hosted services. Third-party materials retain their own licenses and notices; the source-code license does not grant general trademark rights or change customer data ownership. Hosted-service pricing and terms remain separate.
