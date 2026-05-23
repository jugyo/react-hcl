# Init Reference

`react-hcl init` prepares local TypeScript declarations from Terraform provider schema information.

```bash
react-hcl init
```

## What It Does

`init` performs these steps:

1. Resolves the installed Terraform CLI version.
2. Resolves provider schema information through Terraform.
3. Writes provider schema metadata.
4. Generates declaration files under `.react-hcl/`.
5. Ensures a local `tsconfig.json` exists when needed.

The generated declarations make TSX authoring more useful by giving provider-aware component props in your local project.

## Refreshing Schema Data

Use `--refresh` to ignore the cache TTL and fetch provider schema information again:

```bash
react-hcl init --refresh
```

Use this when provider versions changed, Terraform configuration changed, or local generated types appear stale.

## Generated Files

Generated files live under:

```text
.react-hcl/
```

They are local project support files. Keep them with the project when you want consistent editor and type-checking behavior for other contributors.

## Requirements

`init` expects Terraform CLI to be available in the environment because provider schema resolution is delegated to Terraform.

```bash
terraform version
```

If Terraform is missing or provider schema resolution fails, fix the Terraform setup first, then run `react-hcl init` again.
