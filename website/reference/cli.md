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
react-hcl reverse main.tf -o ./src/main.tsx
react-hcl reverse --module main.tf
cat main.tf | react-hcl reverse -
```

Arguments and options:

| Name | Description |
| --- | --- |
| `<input>` | `.tf` file path, or `-` to read from stdin. |
| `-o, --output <file>` | Write TSX to a file instead of stdout. Parent directories are created automatically. |
| `--module` | Include import/export boilerplate in the generated TSX. |

Use `--module` when you want an immediately editable TSX module rather than only JSX elements.

## `init`

Fetch Terraform provider schema information and generate local TypeScript declarations.

```bash
react-hcl init
react-hcl init --refresh
```

Options:

| Name | Description |
| --- | --- |
| `--refresh` | Ignore the cache TTL and fetch provider schema information again. |

See [Init Reference](/reference/init) for details.

## Common Errors

### `Cannot use stdin and input file together.`

Pass either a file path or stdin, not both.

### `Stdin input is required when input is '-'.`

The input argument is `-`, but no stdin content was provided.

### Provider schema is missing

Run:

```bash
react-hcl init
```

Then run `generate` again.
