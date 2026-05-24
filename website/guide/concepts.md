# Concepts

`react-hcl` is a TSX authoring layer for rendering Terraform configuration.

Use TSX to describe structure, reuse, and shared patterns. Generate Terraform HCL as the artifact that people review and Terraform CLI consumes.

## How Generation Works

`react-hcl generate` loads a TSX module, evaluates its default export, collects the primitive Terraform blocks returned by JSX components, and serializes those blocks to HCL.

```text
TSX entrypoint
  -> default export JSX
  -> primitive Terraform blocks
  -> generated .tf
```

Custom components run during this generation step. They do not appear in the generated HCL.

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

The generated HCL contains the security group and instance resources, not a `WebServer` block.

## HCL Remains The Artifact

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

Output order follows TSX evaluation and declaration order. `react-hcl` does not sort blocks automatically, so generated diffs stay close to the source shape.

## References

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

Use `tf` helpers when a JSX attribute should become a Terraform expression:

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

Common helpers:

- `tf.var("name")` for `var.name`
- `tf.local("name")` for `local.name`
- `tf.raw("...")` for an explicit Terraform expression
- `tf.block({ ... })` when a value should be emitted as a nested block

## Attribute Syntax And Body Text

For most blocks, JSX attributes are the clearest form:

```tsx
<Resource
  type="aws_vpc"
  label="main"
  cidr_block="10.0.0.0/16"
/>
```

For Terraform syntax that is easier to keep as HCL, pass body text:

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

Use body text as an escape hatch for complex Terraform constructs or migration from existing HCL.

## Output Boundary

`react-hcl generate` produces Terraform HCL as its output.
The generated `.tf` file can then be used with the standard Terraform CLI.
