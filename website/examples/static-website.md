# Static Website

Source: `examples/static-website`

## What This Example Shows

This example creates an S3 bucket and CloudFront distribution for a static website.

It demonstrates:

- Terraform variables through `<Variable>`
- Terraform expressions through `tf.var`, `tf.local`, and `tf.raw`
- refs between S3, CloudFront, and policy document blocks
- HCL body text for nested CloudFront and IAM policy structures

## Input Structure

```text
examples/static-website/
  input/main.tsx
  output/main.tf
```

## Key TSX Snippet

```tsx
const bucketRef = useRef();
const oacRef = useRef();
const distributionRef = useRef();
const policyDocRef = useRef();

<Variable
  label="domain_name"
  type="string"
  description="Domain name for the website"
/>

<Locals s3_origin_id={tf.raw('"${var.domain_name}-origin-id"')} />

<Resource
  type="aws_s3_bucket"
  label="this"
  ref={bucketRef}
  bucket={tf.var("domain_name")}
/>
```

## Direct HCL Body Text

Some Terraform shapes are clearer as HCL body text:

```tsx
<Resource
  type="aws_cloudfront_distribution"
  label="this"
  ref={distributionRef}
>
  {`
    origin {
      domain_name              = ${bucketRef.bucket_regional_domain_name}
      origin_id                = local.s3_origin_id
      origin_access_control_id = ${oacRef.id}
    }

    enabled             = true
    default_root_object = ${tf.var("default_root_object")}
  `}
</Resource>
```

## Generated HCL Snippet

```hcl
resource "aws_s3_bucket" "this" {
  bucket = var.domain_name
}

resource "aws_cloudfront_distribution" "this" {
  origin {
    domain_name              = aws_s3_bucket.this.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = var.default_root_object
}
```

## Notes

This example is useful when migrating complex nested Terraform syntax. Keep simple values in JSX attributes and use HCL body text where Terraform's native shape is easier to read.
