# react-terraform

A transpiler that converts TSX into Terraform `.tf` files. Write Terraform configurations using JSX/TSX syntax with a custom JSX runtime (no React dependency).

## Tech Stack

- **Runtime / Package Manager / Test**: [Bun](https://bun.sh)
- **TSX Transpilation**: esbuild
- **JSX**: Custom JSX runtime (`jsxImportSource: "react-terraform"`)

## Development

```bash
bun install
bun test
```

## Documentation

- [PRD](docs/prd.md)
- [Design Document](docs/design-doc.md)
- [Implementation Plan](docs/plan.md)
