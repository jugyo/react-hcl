# Development

This guide covers local development for contributors.

Use Bun for project commands. Do not use npm, pnpm, or yarn for repository scripts unless a release or external package workflow explicitly requires it.

## Prerequisites

- Bun
- TypeScript 5
- Terraform CLI when working on provider schema generation or Terraform example validation

Install dependencies:

```bash
bun install
```

## Project Structure

| Path | Role |
| --- | --- |
| `src/cli/` | CLI entrypoint and command implementations for `generate`, `reverse`, and `init`. |
| `src/components/` | Primitive Terraform JSX components such as `Resource`, `Data`, and `Module`. |
| `src/hooks/` | Hook implementations such as `useRef`. |
| `src/provider-schema/` | Provider schema metadata, normalization, and runtime registry lookup. |
| `src/jsx-runtime.ts` | JSX runtime entry used by `jsxImportSource`. |
| `tests/` | Unit, integration, and e2e tests. |
| `examples/` | Example TSX projects used by tests and documentation. |
| `scripts/` | Validation, smoke test, and release scripts. |
| `docs/` | Source product, design, and development notes. |
| `website/` | VitePress public documentation site. |

## Common Commands

| Command | Purpose |
| --- | --- |
| `bun run lint` | Run Biome checks. |
| `bun run lint:fix` | Run Biome and apply safe fixes. |
| `bun run test` | Run unit, integration, and e2e tests. |
| `bun run build` | Build JavaScript bundles and declaration files. |
| `bun run build:types` | Emit TypeScript declaration files into `dist/`. |
| `bun run typecheck:examples` | Type-check the example projects. |
| `bun run docs:build` | Build the VitePress documentation site. |
| `bun run docs:dev` | Start the VitePress development server. |
| `bun run docs:preview` | Preview the built documentation site. |
| `bun run test:smoke:packed-install` | Pack and install the package in a temporary project to verify package installability. |
| `bun run tf:validate:examples` | Run `terraform validate` for generated example outputs. |

## Recommended Local Loop

For most changes:

```bash
bun run lint
bun run test
```

For documentation changes:

```bash
bun run docs:build
bun run lint
```

For example changes:

```bash
bun run typecheck:examples
bun run test
```

## CLI and Packaging Changes

When changing CLI behavior, build output, package exports, or dependencies, also run:

```bash
bun run build
bun run test:smoke:packed-install
```

The smoke test catches package installation issues that may not appear in unit tests.

## Provider Schema and `init`

When working on `react-hcl init`, provider schema resolution, or generated declarations, Terraform CLI must be available.

Useful command:

```bash
bun src/cli/index.ts init
```

`init` generates local files under `.react-hcl/` so TSX type-checking can use provider-aware declarations.

## Documentation Site

The public documentation site lives in `website/`.

Run the development server:

```bash
bun run docs:dev
```

Build the static site:

```bash
bun run docs:build
```

The GitHub Pages workflow builds the same site when changes are pushed to `main`.

## CI

The main CI workflow runs:

- `bun install --frozen-lockfile`
- `bun run lint`
- `bun run build:types`
- `bun run docs:build`
- `bun test`
- `bun run typecheck:examples`
- `bun run build`
- `bun pm pack --dry-run`

Run the subset relevant to your change locally before opening a pull request.

## Release Overview

The release script is:

```bash
bun run release
```

It performs a clean worktree check, tests, packed-install smoke testing, tag creation, push with tags, `bun publish`, and npm verification.

Use:

```bash
bun run release --skip-tests
```

only when tests were already run in the same commit context.

## Troubleshooting

### CLI works locally but fails after install

Run:

```bash
bun run test:smoke:packed-install
```

This validates the npm tarball install path.

### Provider types look stale

Run:

```bash
bun src/cli/index.ts init
```

Use the published CLI's `react-hcl init --refresh` flow when checking user-facing behavior.

### Documentation builds locally but links look wrong

Check `website/.vitepress/config.ts`, especially the `base` setting for GitHub Pages.
