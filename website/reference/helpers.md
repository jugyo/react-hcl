# Helpers Reference

The `tf` helper creates Terraform expressions inside JSX attributes.

```tsx
import { Data, Resource, tf } from "react-hcl";
```

## `tf.var(name)`

Reference a Terraform variable:

```tsx
<Resource
  type="aws_instance"
  label="web"
  instance_type={tf.var("instance_type")}
/>
```

```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
}
```

## `tf.local(name)`

Reference a Terraform local value:

```tsx
<Resource
  type="aws_instance"
  label="web"
  tags={tf.local("common_tags")}
/>
```

```hcl
resource "aws_instance" "web" {
  tags = local.common_tags
}
```

## `tf.raw(value)`

Emit a Terraform expression exactly as provided.

```tsx
<Resource
  type="aws_instance"
  label="web"
  subnet_id={tf.raw("module.vpc.public_subnets[0]")}
/>
```

```hcl
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnets[0]
}
```

Use `tf.raw` sparingly. Prefer refs, `tf.var`, and `tf.local` when they express the intent directly.

## `tf.block(value)`

Force nested block syntax for a value.

```tsx
<Data
  type="aws_ami"
  label="ubuntu"
  filter={[
    tf.block({
      name: "name",
      values: ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"],
    }),
  ]}
/>
```

```hcl
data "aws_ami" "ubuntu" {
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"]
  }
}
```

Arrays of `tf.block(...)` values are emitted as repeated nested blocks.

## Expressions vs Strings

Use plain strings for Terraform string values:

```tsx
bucket="my-assets"
```

Use helpers for Terraform expressions:

```tsx
bucket={tf.var("bucket_name")}
tags={tf.local("common_tags")}
subnet_id={tf.raw("module.vpc.public_subnets[0]")}
```
