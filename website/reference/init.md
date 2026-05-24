# Init

`react-hcl init` prepares local TypeScript support for TSX authoring.

```bash
react-hcl init
```

## Requirements

`init` calls Terraform CLI to read provider schema information, so `terraform` must be available:

```bash
terraform version
```

If Terraform is missing or provider schema resolution fails, fix the Terraform setup first, then run `react-hcl init` again.

## What It Writes

`init` creates or updates:

- `.react-hcl/provider-schema/` for cached provider schema data
- `.react-hcl/metadata.json` for active provider schema metadata
- `.react-hcl/gen/` for generated TypeScript declarations
- `tsconfig.json` when one does not already exist

Existing `tsconfig.json` files are left unchanged.

## Local Support Files

The `.react-hcl/` files support editor completions, TypeScript checking, and runtime schema lookup for `react-hcl generate`.
They are not Terraform configuration and are not part of the generated HCL review artifact.

## Refresh Schema Data

Use `--refresh` to fetch provider schema data again instead of using the local cache:

```bash
react-hcl init --refresh
```
