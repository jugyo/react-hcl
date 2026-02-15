import { createAwsResource, type GenericAwsResourceProps } from "./shared";

export type AwsS3BucketProps = GenericAwsResourceProps & {
  bucket?: string;
  force_destroy?: boolean;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket
 * Verified: 2026-02-15
 */
export function AwsS3Bucket(props: AwsS3BucketProps) {
  return createAwsResource("aws_s3_bucket", props);
}

export type AwsS3BucketPolicyProps = GenericAwsResourceProps & {
  bucket: string;
  policy: string;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_policy
 * Verified: 2026-02-15
 */
export function AwsS3BucketPolicy(props: AwsS3BucketPolicyProps) {
  return createAwsResource("aws_s3_bucket_policy", props);
}

export type AwsS3BucketPublicAccessBlockProps = GenericAwsResourceProps & {
  bucket: string;
  block_public_acls: boolean;
  block_public_policy: boolean;
  ignore_public_acls: boolean;
  restrict_public_buckets: boolean;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/s3_bucket_public_access_block
 * Verified: 2026-02-15
 */
export function AwsS3BucketPublicAccessBlock(props: AwsS3BucketPublicAccessBlockProps) {
  return createAwsResource("aws_s3_bucket_public_access_block", props);
}
