# NodeDots Pre-flight CLI

Follow a local change into its connected code, configuration, and tests before pushing.

**Source preview, Node.js 22+.** This package is not published to npm. Build it from the NodeDots repository:

```sh
npm ci
npm run cli:build
npm run preflight -- --staged
```

Check another repository without starting the web app or connecting GitHub:

```sh
node packages/cli/dist/nodedots.cjs check --cwd /path/to/repository
```

Create a portable installation artifact with `npm pack ./packages/cli`. Install the resulting archive with `npm install --global ./nodedots-cli-0.1.0.tgz`. The installed command is `nodedots check`; the bundle needs Node and Git, with no web server or runtime npm dependencies.

## Select the snapshot

```sh
nodedots check                                      # tracked working changes vs HEAD
nodedots check --staged                             # index contents vs HEAD
nodedots check --include-untracked                  # add non-ignored untracked files
nodedots check --base HEAD~1 --head HEAD --format json
nodedots check --staged --fail-on high --require-full
nodedots check --help
```

`--base` is a direct comparison, not an automatic merge-base selection. Both commits must already exist locally. Unborn repositories and unresolved index conflicts produce input errors. Working-tree mode uses index paths and local contents; a staged deletion stays deleted even if an untracked replacement exists unless untracked inclusion is requested. Staged and committed checks ignore dirty local file contents.

## Output and exit codes

Terminal and JSON reports include evidence, severity, coverage, skipped files, and unknowns. JSON schema version is 1; `cliVersion`, snapshot metadata, `advisory`, `exitCode`, and the engine `report` are included. Redirect stdout to retain a report; errors go to stderr.

| Code | Meaning |
| --- | --- |
| 0 | Selected policy passed; default is advisory. This does not establish safety. |
| 1 | A non-uncertain observation meets `--fail-on high`, `medium`, or `low`. |
| 2 | Invalid input, unavailable Git history, or runtime failure. |
| 3 | `--require-full` requested and scope is incomplete or findings were withheld. |

Coverage requirements take precedence over severity gates. Uncertain hypotheses are excluded from finding gates. These flags are opt-in: the CLI does not install hooks, change branch protection, or replace tests and human review.

## Local scope

Deterministic analysis supports selected JavaScript/TypeScript and Prisma patterns and environment inventories (`.env.example` by default, configurable with `--env-example`). No external AI calls, source uploads, fetching, fixes, or repository-code execution. Git clean filters are not applied to local files. Local checks can examine public or private repositories you can access; hosted beta access rules are separate.

Private `.env` files, `.dev.vars`, credential extensions, linked paths, generated files, dependencies, binary files, and unsupported changed files are excluded with coverage notes. Do not put secrets in source or example inventories. Limits: 1 MB per file, 500 changed files, 10,000 eligible files, and 100 MB each for Git blobs and working content. Dynamic relationships, unsupported languages, graph limits, and omitted findings remain visible limitations. Source evidence may appear in reports: handle exported output accordingly.

License: Apache-2.0. [Documentation](https://nodedots.com/doc/pre-flight-cli) · [Source](https://github.com/0x-Sigmoid/nodedots).
