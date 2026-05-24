# Static Website

This example shows how to mix structured TSX props with Terraform body text when a configuration has deeply nested blocks.

## What To Notice

- Simple Terraform blocks stay as JSX props.
- Deeply nested CloudFront and IAM policy bodies stay as HCL body text.
- Refs can still be used inside body text.
- A data source ref can feed a later resource.

## Simple Blocks Stay As Props

Variables, locals, and the S3 bucket are straightforward TSX:

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

<Variable
  label="default_root_object"
  type="string"
  default="index.html"
/>

<Locals s3_origin_id={tf.raw('"${var.domain_name}-origin-id"')} />

<Resource
  type="aws_s3_bucket"
  label="this"
  ref={bucketRef}
  bucket={tf.var("domain_name")}
/>
```

Generated HCL:

```hcl
variable "domain_name" {
  type        = string
  description = "Domain name for the website"
}

variable "default_root_object" {
  type    = string
  default = "index.html"
}

locals {
  s3_origin_id = "${var.domain_name}-origin-id"
}

resource "aws_s3_bucket" "this" {
  bucket = var.domain_name
}
```

## Nested Blocks Can Keep HCL Shape

The CloudFront distribution has nested blocks where native HCL is easier to scan.
Refs and helpers can be interpolated into that body text:

```tsx
<Resource
  type="aws_cloudfront_origin_access_control"
  label="this"
  ref={oacRef}
>
  {`
    name                              = ${tf.var("domain_name")}
    origin_access_control_origin_type = "s3"
    signing_behavior                  = "always"
    signing_protocol                  = "sigv4"
  `}
</Resource>

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

Generated HCL:

```hcl
resource "aws_cloudfront_origin_access_control" "this" {
  name                              = var.domain_name
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "this" {
  origin {
    domain_name              = aws_s3_bucket.this.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.this.id
  }

  enabled             = true
  default_root_object = var.default_root_object
}
```

## Data Sources Can Feed Resources

The policy document is a data source with body text.
Its generated `json` attribute is then passed to the bucket policy resource:

```tsx
<Data type="aws_iam_policy_document" label="this" ref={policyDocRef}>
  {`
    statement {
      actions   = ["s3:GetObject"]
      resources = ["\${${bucketRef.arn}}/*"]

      condition {
        test     = "StringEquals"
        variable = "AWS:SourceArn"
        values   = [${distributionRef.arn}]
      }

      principals {
        type        = "Service"
        identifiers = ["cloudfront.amazonaws.com"]
      }
    }
  `}
</Data>

<Resource
  type="aws_s3_bucket_policy"
  label="this"
  bucket={bucketRef.id}
  policy={policyDocRef.json}
/>
```

Generated HCL:

```hcl
data "aws_iam_policy_document" "this" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.this.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.this.arn]
    }

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
  }
}

resource "aws_s3_bucket_policy" "this" {
  bucket = aws_s3_bucket.this.id
  policy = data.aws_iam_policy_document.this.json
}
```

## Takeaway

Use JSX props for the parts that benefit from structure and type help.
Use body text when Terraform's native nested syntax is clearer.
Refs work in both places, so the generated HCL still contains normal Terraform references.
