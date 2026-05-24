# CLI Reference

The `react-hcl` CLI converts between JSX/TSX and Terraform HCL.

```bash
react-hcl generate <input.(j|t)sx|-> [-o <file>]
react-hcl reverse <input.tf|-> [-o <file>] [--module]
react-hcl init [--refresh]
```

## `generate`

Convert JSX/TSX to Terraform HCL.

```bash
react-hcl generate infra.tsx
react-hcl generate infra.tsx -o ./tf/main.tf
cat infra.tsx | react-hcl generate -
```

Arguments and options:

| Name | Description |
| --- | --- |
| `<input>` | TSX/JSX file path, or `-` to read from stdin. |
| `-o, --output <file>` | Write HCL to a file instead of stdout. Parent directories are created automatically. |

Notes:

- File input and stdin cannot be used at the same time.
- When input is `-`, stdin must contain the TSX/JSX source.
- The TSX module should export the root JSX element as the default export.
- Provider schema metadata is loaded at runtime. Run [`react-hcl init`](/reference/init) before generating in a new project.

## `reverse`

Convert Terraform HCL to JSX/TSX.

```bash
react-hcl reverse main.tf
react-hcl reverse --module main.tf
cat main.tf | react-hcl reverse - -o ./src/main.tsx
```

Arguments and options:

| Name | Description |
| --- | --- |
| `<input>` | `.tf` file path, or `-` to read from stdin. |
| `-o, --output <file>` | Write TSX to a file instead of stdout. Parent directories are created automatically. |
| `--module` | Include import/export boilerplate in the generated TSX. |

Use `--module` when you want an immediately editable TSX module rather than only JSX elements.

## `init`

Fetch Terraform provider schema and generate TypeScript declarations.

```bash
react-hcl init
react-hcl init --refresh
```

Options:

| Name | Description |
| --- | --- |
| `--refresh` | Ignore cache TTL and refresh provider schema from Terraform CLI. |

See [react-hcl init](/reference/init) for details.
