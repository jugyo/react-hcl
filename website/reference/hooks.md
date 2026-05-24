# Hooks

## `useRef()`

`useRef()` creates a Terraform reference object. Attach it to a block with the `ref` prop, then read attributes from the same ref.

```tsx
import { Resource, useRef } from "react-hcl";

function Main() {
  const vpcRef = useRef();

  return (
    <>
      <Resource
        type="aws_vpc"
        label="main"
        ref={vpcRef}
        cidr_block="10.0.0.0/16"
      />
      <Resource
        type="aws_subnet"
        label="public"
        vpc_id={vpcRef.id}
        cidr_block="10.0.1.0/24"
      />
    </>
  );
}
```

Generated HCL:

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"
}
```

## Supported Block Types

Refs can be attached to:

- `<Resource>`
- `<Data>`
- `<Module>`
- `<Provider>`

Reference prefixes are generated from the attached block:

| Block | Example ref access | HCL expression |
| --- | --- | --- |
| `<Resource type="aws_vpc" label="main" />` | `vpcRef.id` | `aws_vpc.main.id` |
| `<Data type="aws_ami" label="ubuntu" />` | `amiRef.id` | `data.aws_ami.ubuntu.id` |
| `<Module label="vpc" />` | `vpcRef.vpc_id` | `module.vpc.vpc_id` |

## `depends_on`

Pass refs in `depends_on` arrays:

```tsx
<Resource
  type="aws_instance"
  label="web"
  ami={amiRef.id}
  instance_type="t3.micro"
  depends_on={[vpcRef]}
/>
```

The generated HCL uses the block reference without an attribute suffix.

## Provider Refs

Provider aliases can be referenced through refs:

```tsx
const eastRef = useRef();

<>
  <Provider type="aws" alias="east" region="us-east-1" ref={eastRef} />
  <Resource
    type="aws_s3_bucket"
    label="assets"
    provider={eastRef}
    bucket="example-assets"
  />
</>
```

## Notes

- A ref must be attached to a block before generated HCL can resolve its expression.
- Attribute access is lazy, so `ref.id`, `ref.arn`, and nested paths such as `ref.outputs.vpc_id` can be used as Terraform expressions.
- Use refs for Terraform references, not for ordinary strings.
