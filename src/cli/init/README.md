# init command internals

This directory contains the implementation of the `react-hcl init` subcommand.

## What `init` does

`init` prepares a project for TSX authoring without requiring a local `react-hcl` dependency.

It performs the following steps:

1. Resolve Terraform CLI version (`terraform version -json`).
2. Load AWS provider schema from `.react-hcl/provider-schema/` or fetch it via Terraform.
3. Persist active provider schema selection in `.react-hcl/metadata.json`.
4. Normalize Terraform schema JSON into an internal shape for type generation.
5. Render provider-specific TypeScript declarations under `.react-hcl/gen/aws/`.
6. Copy bundled runtime declaration files into `.react-hcl/gen/react-hcl/`.
7. Remove stale generated files and update `.react-hcl/gen/metadata.json`.
8. Create `tsconfig.json` if missing.

## File responsibilities

- `index.ts`: Orchestrates the full init flow.
- `provider-schema/resolver.ts`: Terraform command execution, provider schema storage, and schema resolution.
- `schema-type/render.ts`: Type declaration rendering for resources, data sources, providers, and augmentation.
- `schema-type/output.ts`: Generated file writing, stale cleanup, metadata generation, and `tsconfig` creation.
- `runtime-shim/source.ts`: Bundled declaration source discovery and filtering.
- `runtime-shim/copy.ts`: Runtime declaration file materialization for local type resolution.
- `paths.ts`: Shared path construction for generated outputs and package-relative lookup.
- `io.ts`: Atomic file write utility.
- `log.ts`: Init log output helper.
- `types.ts`: Init-facing type barrel for shared type definitions.
- `utils.ts`: Shared stable hashing/stringification/path helpers.
- `../../provider-schema/`: Core provider schema domain (`store`, `registry`, `normalize`, and shared types).

## Important design choices

- Runtime declarations are copied from bundled `.d.ts` files so users can type-check TSX without adding project-local `react-hcl`.
- `cli/` declarations are intentionally excluded from copy output. They are not needed for TSX authoring and would add noise.
- Strict schema typing is enabled by generated module augmentation (`__strictSchema: true`) in `.react-hcl/gen/aws/index.generated.d.ts`.
- Existing `tsconfig.json` is never overwritten; init only creates one when missing.

## Validation checklist

Run these after changes:

```bash
bun test tests/e2e/cli-init.test.ts
bun run build:types
```
