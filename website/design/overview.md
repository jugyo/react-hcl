# Design Overview

`react-hcl` exists to improve the authoring and review experience around Terraform configuration while keeping Terraform as the execution engine.

## Design Goals

- Use JSX/TSX as a structured authoring format.
- Generate readable Terraform HCL.
- Preserve component grouping through output order.
- Keep Terraform validation and execution outside `react-hcl`.
- Fit into existing Terraform CLI workflows.

## Why Output HCL?

HCL is the artifact Terraform users already know how to review, validate, plan, and apply.

By generating HCL, `react-hcl` keeps the deployment boundary familiar:

```text
react-hcl output -> Terraform CLI
```

This avoids making `react-hcl` responsible for provider behavior, state, or deployment orchestration.

## Component Expansion

Components are an authoring structure, not a new Terraform runtime abstraction.

Custom components can group multiple Terraform blocks:

```tsx
function Network() {
  return (
    <>
      <Resource type="aws_vpc" label="main" cidr_block="10.0.0.0/16" />
      <Resource type="aws_subnet" label="public" cidr_block="10.0.1.0/24" />
    </>
  );
}
```

The output contains only Terraform blocks:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  cidr_block = "10.0.1.0/24"
}
```

## Hybrid Syntax

The primary syntax is JSX attributes because it works well for ordinary Terraform attributes and TypeScript assistance.

For complex Terraform constructs, HCL body text is supported so users do not need to force every Terraform shape into object syntax.

This hybrid approach keeps simple configuration structured and complex Terraform syntax available.

## References

Terraform references are represented with `useRef()`.

The ref is attached to a block and read where a Terraform reference is needed:

```tsx
const vpcRef = useRef();

<>
  <Resource type="aws_vpc" label="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
  <Resource type="aws_subnet" label="public" vpc_id={vpcRef.id} />
</>
```

This produces:

```hcl
vpc_id = aws_vpc.main.id
```

## Minimal Validation

`react-hcl` performs structural checks that are visible during transpilation, such as duplicate block conflicts.

Provider-specific validity remains Terraform's job. This keeps the tool focused and avoids duplicating provider behavior.

## Operational Boundary

`react-hcl` ends at generated HCL.

Terraform owns:

- provider installation and schema validation
- backend configuration
- state
- planning
- applying
- drift detection
