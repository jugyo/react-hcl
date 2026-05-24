# Concepts

`react-hcl` is an authoring tool for Terraform configuration.

You write JSX/TSX, use components to structure the configuration, and generate Terraform HCL as the artifact that Terraform CLI consumes.

## Authoring Format vs Output Format

JSX/TSX is the authoring format. HCL is the output format.

```text
TSX entrypoint
  -> component evaluation
  -> primitive Terraform blocks
  -> generated .tf
```

Custom components help organize the source code, but they do not appear in the generated HCL. Their internal primitive blocks are expanded into normal Terraform blocks.

## Components Are Structural Units

Primitive components map directly to Terraform blocks:

| Component | HCL block |
| --- | --- |
| `<Resource>` | `resource` |
| `<Data>` | `data` |
| `<Module>` | `module` |
| `<Provider>` | `provider` |
| `<Variable>` | `variable` |
| `<Output>` | `output` |
| `<Locals>` | `locals` |
| `<Terraform>` | `terraform` |

Custom components are for structure, reuse, and readability:

```tsx
function WebServer({ subnetId, instanceType }) {
  return (
    <>
      <Resource
        type="aws_security_group"
        label="web"
        vpc_id={tf.var("vpc_id")}
      />
      <Resource
        type="aws_instance"
        label="web"
        subnet_id={subnetId}
        instance_type={instanceType}
      />
    </>
  );
}
```

The generated HCL contains the security group and instance blocks. It does not contain a `WebServer` block.

## Output Order

Output order follows component evaluation and declaration order.

`react-hcl` does not sort blocks automatically. This preserves the source structure in the generated HCL, which makes generated diffs easier to relate back to the TSX source.

## References with `useRef`

Use `useRef()` when one Terraform block needs to reference another.

```tsx
const bucketRef = useRef();

<>
  <Resource
    type="aws_s3_bucket"
    label="assets"
    ref={bucketRef}
    bucket="example-assets"
  />
  <Output label="bucket_id" value={bucketRef.id} />
</>
```

Generated HCL:

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "example-assets"
}

output "bucket_id" {
  value = aws_s3_bucket.assets.id
}
```

Refs represent Terraform references. Plain strings remain Terraform strings.

## Terraform Expressions

Use helper functions when a JSX attribute should become a Terraform expression instead of a string:

```tsx
<Resource
  type="aws_instance"
  label="web"
  instance_type={tf.var("instance_type")}
  tags={tf.local("common_tags")}
/>
```

Generated HCL:

```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type
  tags          = local.common_tags
}
```

Use:

- `tf.var("name")` for `var.name`
- `tf.local("name")` for `local.name`
- `tf.raw("...")` for an explicit Terraform expression
- `tf.block({ ... })` when a value should be emitted as a nested block

## Attribute Syntax and HCL Body Text

For most blocks, JSX attributes are the clearest form:

```tsx
<Resource
  type="aws_vpc"
  label="main"
  cidr_block="10.0.0.0/16"
/>
```

For complex Terraform constructs, direct HCL body text can be easier:

```tsx
<Resource type="aws_security_group" label="example">
  {`
    dynamic "ingress" {
      for_each = var.ports
      content {
        from_port   = ingress.value
        to_port     = ingress.value
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
  `}
</Resource>
```

Use attribute syntax for ordinary configuration and HCL body text when Terraform syntax is the better tool for the block body.

## Build-Time JavaScript

JavaScript conditionals and loops run before HCL is generated.

```tsx
{subnets.map((cidr, index) => (
  <Resource
    type="aws_subnet"
    label={`public_${index}`}
    cidr_block={cidr}
  />
))}
```

The generated HCL contains concrete Terraform blocks. It does not contain the JavaScript loop.

## Responsibility Boundary

`react-hcl` is responsible for:

- evaluating the TSX entrypoint
- expanding components
- resolving refs
- serializing Terraform blocks to HCL
- detecting selected structural conflicts

Terraform remains responsible for:

- provider behavior
- formatting and validation
- planning and applying
- state management
- runtime input values
