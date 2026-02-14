# react-terraform

A transpiler that converts TSX into Terraform `.tf` files. Write Terraform configurations using JSX/TSX syntax with a custom JSX runtime (no React dependency).

## Usage

```bash
react-terraform infra.tsx                  # output to stdout
react-terraform infra.tsx -o ./tf/main.tf   # write to file
```

## Example

```tsx
// infra.tsx
import { Resource, useRef } from "react-terraform";

function App() {
  const vpcRef = useRef();
  return (
    <>
      <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
      <Resource type="aws_subnet" name="public" vpc_id={vpcRef.id} cidr_block="10.0.1.0/24" />
    </>
  );
}

export default <App />;
```

```bash
$ react-terraform infra.tsx
```

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
```

## Components

| Component | HCL block |
|---|---|
| `<Resource>` | `resource "type" "name" { ... }` |
| `<DataSource>` | `data "type" "name" { ... }` |
| `<Variable>` | `variable "name" { ... }` |
| `<Output>` | `output "name" { ... }` |
| `<Locals>` | `locals { ... }` |
| `<Provider>` | `provider "type" { ... }` |
| `<Terraform>` | `terraform { ... }` |

## Hooks & Helpers

- `useRef()` - Create a reference to a resource/data source (`ref.id`, `ref.arn`, etc.)
- `tf.var("name")` - Reference a variable (`var.name`)
- `tf.local("name")` - Reference a local value (`local.name`)

## Installation

### From npm

```bash
npm install -g react-terraform
```

### Manual install from source

```bash
git clone https://github.com/jugyo/react-terraform.git
cd react-terraform
bun install
bun run build
npm link
```

After this, the `react-terraform` command is available globally.

## Development

```bash
git clone https://github.com/jugyo/react-terraform.git
cd react-terraform
bun install
```

Run the CLI directly without building:

```bash
bun src/cli.ts infra.tsx
bun src/cli.ts infra.tsx -o ./tf/main.tf
```

Run tests:

```bash
bun test
```

Build:

```bash
bun run build
```

## Documentation

- [Design Document](docs/design-doc.md)
- [Implementation Plan](docs/plan.md)
