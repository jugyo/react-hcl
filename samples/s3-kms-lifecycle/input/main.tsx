import { Output, Provider, Resource, Terraform, useRef } from "react-hcl";

function Main({ region }: { region: string }) {
  const keyRef = useRef();
  const bucketRef = useRef();

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

      <Resource
        type="aws_kms_key"
        label="bucket"
        ref={keyRef}
        description="KMS key for S3 server-side encryption"
        enable_key_rotation={true}
        deletion_window_in_days={7}
      />

      <Resource
        type="aws_s3_bucket"
        label="archive"
        ref={bucketRef}
        bucket_prefix="react-hcl-archive-"
        force_destroy={false}
      />

      <Resource
        type="aws_s3_bucket_server_side_encryption_configuration"
        label="archive"
        bucket={bucketRef.id}
        rule={[
          {
            apply_server_side_encryption_by_default: {
              kms_master_key_id: keyRef.arn,
              sse_algorithm: "aws:kms",
            },
            bucket_key_enabled: true,
          },
        ]}
      />

      <Resource
        type="aws_s3_bucket_versioning"
        label="archive"
        bucket={bucketRef.id}
        versioning_configuration={{
          status: "Enabled",
        }}
      />

      <Resource
        type="aws_s3_bucket_lifecycle_configuration"
        label="archive"
        bucket={bucketRef.id}
        rule={[
          {
            id: "log-retention",
            status: "Enabled",
            filter: [
              {
                prefix: "logs/",
              },
            ],
            transition: [
              {
                days: 30,
                storage_class: "STANDARD_IA",
              },
              {
                days: 90,
                storage_class: "GLACIER",
              },
            ],
            expiration: [
              {
                days: 365,
              },
            ],
            noncurrent_version_expiration: [
              {
                noncurrent_days: 180,
              },
            ],
          },
        ]}
      />

      <Resource
        type="aws_s3_bucket_public_access_block"
        label="archive"
        bucket={bucketRef.id}
        block_public_acls={true}
        block_public_policy={true}
        ignore_public_acls={true}
        restrict_public_buckets={true}
      />

      <Output name="bucket_name" value={bucketRef.id} />
      <Output name="kms_key_arn" value={keyRef.arn} />
    </>
  );
}

export default <Main region="ap-northeast-1" />;
