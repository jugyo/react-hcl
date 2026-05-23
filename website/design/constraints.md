# Constraints

This page documents the practical scope and boundaries of `react-hcl`.

## Scope

`react-hcl` supports:

- TSX/JSX to Terraform HCL generation
- Terraform primitive blocks through components
- custom components for source organization
- Terraform references through `useRef`
- Terraform expression helpers through `tf`
- build-time JavaScript conditionals and loops
- HCL to TSX reverse conversion
- local provider declaration generation with `react-hcl init`

## Non-Scope

`react-hcl` does not handle:

- `terraform plan`
- `terraform apply`
- `terraform validate`
- state management
- backend management
- provider implementation
- policy enforcement
- orchestration across workspaces or stacks

Use Terraform CLI and your existing Terraform tooling for those responsibilities.

## Output Constraints

The generated output is Terraform HCL.

Output order follows TSX evaluation and declaration order. Blocks are not automatically sorted.

Custom components do not appear as HCL blocks. They expand to their internal primitive blocks.

## Conflict Detection

`react-hcl` detects structural conflicts that would make the generated configuration ambiguous or invalid:

- duplicate resources with the same `type + label`
- duplicate data sources with the same `type + label`
- duplicate variables
- duplicate outputs
- duplicate provider configurations with the same `type + alias`
- multiple Terraform blocks

A resource and a data source may share the same `type + label` because Terraform treats them as different block kinds.

## Attribute Validation

Attribute validity is intentionally not fully enforced by `react-hcl`.

Generated HCL should be validated by Terraform:

```bash
terraform validate
```

This matters because provider schemas, provider versions, backend settings, and runtime values are Terraform concerns.

## HCL Body Text

HCL body text is passed through after JavaScript expression evaluation.

Use it for complex Terraform constructs such as `dynamic` blocks or migration from existing HCL. Validate the generated result with Terraform CLI.

## Environment Strategy

Prefer concrete generated HCL per environment.

Common patterns:

- separate TSX entrypoints such as `prod.tsx` and `staging.tsx`
- shared components with environment-specific props
- Terraform variables for runtime values
- separate output directories per environment

Example:

```bash
react-hcl generate src/prod.tsx -o envs/prod/main.tf
react-hcl generate src/staging.tsx -o envs/staging/main.tf
```

Do not embed secrets into generated HCL during TSX evaluation. Use Terraform variables or data sources for secret values.
