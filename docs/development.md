# Development Guide

This document is the practical guide for contributors.
It covers local setup, project structure, scripts, testing, and release operations.

## Prerequisites

- Use Bun for project commands.
- Install dependencies with `bun install`.
- This project uses a custom JSX runtime, not React runtime.
  - `tsconfig.json` sets `jsxImportSource` to `"react-hcl"`.

## Core Concepts

- `react-hcl` compiles JSX/TSX into Terraform HCL.
- Runtime and CLI implementation are ESM-oriented.
- `hcl2-parser` is consumed via CJS-compatible import handling to keep Node.js runtime compatibility.

## Project Structure

| Path | Role |
| --- | --- |
| `src/cli/` | CLI entrypoint and command implementations (`generate`, `reverse`, `init`). |
| `src/components/` | Primitive Terraform JSX components (`Resource`, `Data`, `Module`, etc.). |
| `src/hooks/` | Hook implementations such as `useRef`. |
| `src/cli/init/provider-schema/` | Terraform CLI I/O for provider schema fetch/cache resolution used by `react-hcl init`. |
| `src/provider-schema/` | Core provider schema domain: metadata store, schema normalization, and runtime registry lookup. |
| `src/jsx-runtime.ts` | Custom JSX runtime entry for `jsxImportSource`. |
| `tests/` | Unit/integration/e2e tests. |
| `examples/` | Example TSX projects used by integration tests and docs. |
| `scripts/` | Utility scripts for validation, smoke checks, and release workflow. |
| `docs/` | Product/design/development documentation. |

## Script Reference

| Script | Command | Purpose |
| --- | --- | --- |
| `build` | `bun run build:js && bun run build:types` | Build JavaScript bundles and TypeScript declaration files. |
| `build:js` | `bun run build:js:cli && bun run build:js:index && bun run build:js:jsx-runtime` | Build all JavaScript entry points. |
| `build:js:cli` | `bun build src/cli/index.ts ...` | Build the CLI bundle to `dist/cli.js`. |
| `build:js:index` | `bun build src/index.ts ...` | Build the library entry to `dist/index.js`. |
| `build:js:jsx-runtime` | `bun build src/jsx-runtime.ts ...` | Build the custom JSX runtime entry. |
| `build:types` | `tsc -p tsconfig.build.json --emitDeclarationOnly` | Emit `.d.ts` files into `dist/`. |
| `lint` | `bunx biome check .` | Run static checks with Biome. |
| `lint:fix` | `bunx biome check --fix .` | Run Biome and apply safe fixes. |
| `typecheck:examples` | `tsc -p examples/tsconfig.json --noEmit` | Type-check example projects without generating files. |
| `test` | `bun test` | Run all unit, integration, and e2e tests. |
| `test:smoke:packed-install` | `bash scripts/smoke-test-packed-install.sh` | Pack the project, install it via npm in a temp directory, and verify CLI startup. |
| `release` | `bash scripts/release.sh` | Run the release workflow (tests, tag, push with tags, publish, npm verification). |
| `tf:validate:examples` | `bash scripts/terraform-validate-examples.sh` | Run `terraform validate` for example outputs. |
| `prepack` | `bun run build` | Build automatically before packing/publishing. |

## Development Workflow

### Recommended local loop

```bash
bun run lint
bun run test
```

### When CLI or packaging behavior changes

Run the smoke test that validates installability through npm tarball flow:

```bash
bun run test:smoke:packed-install
```

This catches issues that can pass unit tests but fail for npm users.

## Typical Workflows

### Build output for local inspection

```bash
bun run build
```

### Validate Terraform examples

```bash
bun run tf:validate:examples
```

### Refresh generated provider types for local project usage

```bash
bun src/cli/index.ts init
```

`init` also generates local `react-hcl` declaration shims under `.react-hcl/gen/react-hcl/`
so TSX type-checking can work without adding a project-local `react-hcl` dependency.

### Release

```bash
bun run release
```

Use `bun run release --skip-tests` only when tests were already run in the same commit context.

## Release Behavior

`scripts/release.sh` performs:

1. Clean worktree check
2. Test suite and packed-install smoke test (unless skipped)
3. Git tag creation from `package.json` version (`vX.Y.Z`)
4. `git push origin HEAD --follow-tags`
5. `bun publish`
6. npm verification with retry (handles registry propagation delay)

## Troubleshooting

### npm publish succeeded but verification is delayed

- npm metadata can lag briefly.
- `release.sh` retries npm verification automatically.

### CLI works in tests but fails after `npm install`

- Run `bun run test:smoke:packed-install`.
- This validates the real npm install execution path (`npx react-hcl --help`).
