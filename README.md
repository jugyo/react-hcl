# react-hcl

A transpiler that converts JSX/TSX into Terraform `.tf` files.

Use JSX/TSX to structure Terraform configuration with components, then generate normal HCL that can be reviewed, validated, planned, and applied with the standard Terraform CLI.

## Why react-hcl?

HCL is readable at the block level, but large configurations can make data flow and causality hard to follow.

`react-hcl` lets you use component boundaries, props, conditionals, and loops while authoring configuration. Those authoring structures compile away, leaving regular Terraform HCL as the final artifact.

The goal is not to replace Terraform or manage state. `react-hcl` stops at transpilation.

## Quick Start

Install the CLI:

```bash
npm install -g react-hcl
```

Initialize local provider types:

```bash
react-hcl init
```

Create a TSX entrypoint:

```tsx
import { Output, Provider, Resource, useRef } from "react-hcl";

function Main() {
  const bucketRef = useRef();

  return (
    <>
      <Provider type="aws" region="us-east-1" />
      <Resource
        type="aws_s3_bucket"
        label="assets"
        ref={bucketRef}
        bucket="my-react-hcl-assets"
      />
      <Output label="bucket_id" value={bucketRef.id} />
    </>
  );
}

export default <Main />;
```

Generate Terraform HCL:

```bash
react-hcl generate main.tsx -o main.tf
```

Validate and run the generated Terraform with Terraform CLI:

```bash
terraform init
terraform validate
```

## CLI

```bash
react-hcl generate <input.(j|t)sx|-> [-o <file>]
react-hcl reverse <input.tf|-> [-o <file>] [--module]
react-hcl init [--refresh]
```

Examples:

```bash
react-hcl generate infra.tsx
react-hcl generate infra.tsx -o ./tf/main.tf
react-hcl reverse main.tf
react-hcl reverse --module main.tf
cat infra.tsx | react-hcl generate -
cat main.tf | react-hcl reverse -
```

## Components

| Component | HCL block |
| --- | --- |
| `<Resource>` | `resource "type" "label" { ... }` |
| `<Data>` | `data "type" "label" { ... }` |
| `<Module>` | `module "label" { ... }` |
| `<Variable>` | `variable "label" { ... }` |
| `<Output>` | `output "label" { ... }` |
| `<Locals>` | `locals { ... }` |
| `<Provider>` | `provider "type" { ... }` |
| `<Terraform>` | `terraform { ... }` |

## Hooks and Helpers

- `useRef()` - Create a Terraform reference to a resource, data source, module, or provider.
- `tf.var("name")` - Reference a Terraform variable, such as `var.name`.
- `tf.local("name")` - Reference a Terraform local value, such as `local.name`.
- `tf.raw("...")` - Emit a Terraform expression as-is.
- `tf.block({ ... })` - Force nested block syntax.

## Documentation

- [Documentation site](https://jugyo.github.io/react-hcl/)
- [Development Guide](docs/development.md)
- [Design Document](docs/design-doc.md)
- [Product Requirements](docs/prd.md)

## Development

Use Bun for project commands:

```bash
bun install
bun run lint
bun test
bun run build
```

See [docs/development.md](docs/development.md) for contributor workflow details.
