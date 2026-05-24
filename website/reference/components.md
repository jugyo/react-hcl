# Component Reference

Components describe Terraform blocks in JSX/TSX. Custom components can group these primitive components, but only the primitive Terraform blocks are emitted into HCL.

| Component | HCL block |
| --- | --- |
| `<Resource>` | `resource "type" "label" { ... }` |
| `<Data>` | `data "type" "label" { ... }` |
| `<Module>` | `module "label" { ... }` |
| `<Provider>` | `provider "type" { ... }` |
| `<Variable>` | `variable "label" { ... }` |
| `<Output>` | `output "label" { ... }` |
| `<Locals>` | `locals { ... }` |
| `<Terraform>` | `terraform { ... }` |

## `<Resource>`

Use `<Resource>` for Terraform `resource` blocks.

```tsx
<Resource
  type="aws_s3_bucket"
  label="assets"
  bucket="my-assets"
/>
```

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "my-assets"
}
```

`type` and `label` become the Terraform block labels. Other props become HCL attributes.

## `<Data>`

Use `<Data>` for Terraform `data` blocks.

```tsx
<Data
  type="aws_caller_identity"
  label="current"
/>
```

```hcl
data "aws_caller_identity" "current" {
}
```

When a ref is attached, `ref.account_id` becomes `data.aws_caller_identity.current.account_id`.

## `<Module>`

Use `<Module>` for Terraform `module` blocks.

```tsx
<Module
  label="vpc"
  source="terraform-aws-modules/vpc/aws"
  cidr="10.0.0.0/16"
/>
```

```hcl
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  cidr   = "10.0.0.0/16"
}
```

Attach a ref to access module outputs, such as `vpcRef.vpc_id`.

## `<Provider>`

Use `<Provider>` for Terraform `provider` blocks.

```tsx
<Provider type="aws" region="us-east-1" />
```

```hcl
provider "aws" {
  region = "us-east-1"
}
```

Provider aliases are supported:

```tsx
const virginiaRef = useRef();

<Provider
  type="aws"
  alias="virginia"
  region="us-east-1"
  ref={virginiaRef}
/>
```

The provider ref can then be passed to `provider` on a resource or data source.

## `<Variable>`

Use `<Variable>` for Terraform `variable` blocks.

```tsx
<Variable
  label="environment"
  type="string"
  default="dev"
/>
```

```hcl
variable "environment" {
  type    = string
  default = "dev"
}
```

The `type` prop is emitted as a Terraform expression, not a quoted string.

## `<Output>`

Use `<Output>` for Terraform `output` blocks.

```tsx
<Output label="bucket_id" value={bucketRef.id} />
```

```hcl
output "bucket_id" {
  value = aws_s3_bucket.assets.id
}
```

## `<Locals>`

Use `<Locals>` for Terraform `locals` blocks.

```tsx
<Locals
  environment="dev"
  common_tags={{ ManagedBy: "react-hcl" }}
/>
```

```hcl
locals {
  environment = "dev"
  common_tags = {
    ManagedBy = "react-hcl"
  }
}
```

## `<Terraform>`

Use `<Terraform>` for Terraform settings.

```tsx
<Terraform
  required_version=">= 1.0"
  required_providers={{
    aws: {
      source: "hashicorp/aws",
      version: "~> 5.0",
    },
  }}
/>
```

```hcl
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}
```

## Raw HCL Body

`Resource`, `Data`, `Module`, and `Terraform` can accept string children for HCL body text when an expression is easier to write directly.

```tsx
<Resource type="aws_security_group" label="example">
  {`
    name = "example"
  `}
</Resource>
```

When body text is used, JSX attributes other than block labels are not emitted as HCL attributes for that block.
