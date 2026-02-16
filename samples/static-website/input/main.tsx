/**
 * Static Website on S3 + CloudFront
 *
 * S3 bucket + CloudFront distribution with Origin Access Control + IAM policy.
 * Based on: https://github.com/joshuamkite/terraform-aws-static-website-s3-cloudfront-acm
 */
import {
  Data,
  Locals,
  Output,
  Provider,
  Resource,
  Terraform,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function Main({ region }: { region: string }) {
  const bucketRef = useRef();
  const oacRef = useRef();
  const distributionRef = useRef();
  const policyDocRef = useRef();

  return (
    <>
      <Terraform
        required_version=">= 1.2.8"
        required_providers={{
          aws: {
            source: "hashicorp/aws",
            version: "~> 6.0",
          },
        }}
      />
      <Provider type="aws" region={region} />

      <Variable
        name="domain_name"
        type="string"
        description="Domain name for the website"
      />
      <Variable
        name="price_class"
        type="string"
        default="PriceClass_100"
        description="CloudFront distribution price class"
      />
      <Variable
        name="default_root_object"
        type="string"
        default="index.html"
        description="Default root object for CloudFront"
      />

      {/* biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation */}
      <Locals s3_origin_id={tf.raw('"${var.domain_name}-origin-id"')} />

      {/* S3 Bucket */}
      <Resource
        type="aws_s3_bucket"
        name="this"
        ref={bucketRef}
        bucket={tf.var("domain_name")}
      />

      <Resource
        type="aws_s3_bucket_public_access_block"
        name="this"
        bucket={bucketRef.id}
        block_public_acls={true}
        block_public_policy={true}
        ignore_public_acls={true}
        restrict_public_buckets={true}
      />

      {/* CloudFront Origin Access Control */}
      <Resource
        type="aws_cloudfront_origin_access_control"
        name="this"
        ref={oacRef}
      >
        {`
          name                              = ${tf.var("domain_name")}
          description                       = "\${${tf.var("domain_name")}} OAC"
          origin_access_control_origin_type = "s3"
          signing_behavior                  = "always"
          signing_protocol                  = "sigv4"
        `}
      </Resource>

      {/* CloudFront Distribution */}
      <Resource
        type="aws_cloudfront_distribution"
        name="this"
        ref={distributionRef}
      >
        {`
          origin {
            domain_name              = ${bucketRef.bucket_regional_domain_name}
            origin_id                = local.s3_origin_id
            origin_access_control_id = ${oacRef.id}
          }

          enabled             = true
          is_ipv6_enabled     = true
          default_root_object = ${tf.var("default_root_object")}

          default_cache_behavior {
            allowed_methods        = ["GET", "HEAD"]
            cached_methods         = ["GET", "HEAD"]
            target_origin_id       = local.s3_origin_id
            viewer_protocol_policy = "redirect-to-https"
            min_ttl                = 0
            default_ttl            = 86400
            max_ttl                = 31536000

            forwarded_values {
              query_string = false

              cookies {
                forward = "none"
              }
            }
          }

          price_class = ${tf.var("price_class")}

          restrictions {
            geo_restriction {
              restriction_type = "none"
            }
          }

          viewer_certificate {
            cloudfront_default_certificate = true
          }

          wait_for_deployment = false
        `}
      </Resource>

      {/* S3 Bucket Policy - allow CloudFront access */}
      <Data type="aws_iam_policy_document" name="this" ref={policyDocRef}>
        {`
          statement {
            sid       = "AllowCloudFrontServicePrincipal"
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
        name="this"
        bucket={bucketRef.id}
        policy={policyDocRef.json}
      />

      {/* Outputs */}
      <Output
        name="cloudfront_domain_name"
        value={distributionRef.domain_name}
      />
      <Output name="cloudfront_distribution_id" value={distributionRef.id} />
      <Output name="s3_bucket_arn" value={bucketRef.arn} />
    </>
  );
}

export default <Main region="us-east-1" />;
