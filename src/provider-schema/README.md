# provider-schema

Core provider schema domain used by both runtime generation and `react-hcl init`.

## Responsibilities

- Manage active provider schema metadata (`.react-hcl/metadata.json`).
- Load cached provider schema payloads (`.react-hcl/provider-schema/*.json`).
- Normalize raw Terraform provider schema JSON into internal canonical schema.
- Provide runtime schema registry lookup by block context.

## Files

- `types.ts`: Shared types for metadata, cache payloads, normalized schema, and runtime registry.
- `store.ts`: Metadata read/write, active payload loading, and normalized active schema loading.
- `normalize.ts`: Pure normalization logic (`Terraform provider schema JSON -> normalized schema`).
- `registry.ts`: Runtime lookup registry (`resolveBlockSchema`) for serializer validation.
- `index.ts`: Public exports for provider schema domain.

## Layer boundary

- `src/cli/init/*` is I/O orchestration (Terraform CLI execution, generated file output, logging).
- `src/provider-schema/*` is core schema domain logic reused by CLI/runtime.
