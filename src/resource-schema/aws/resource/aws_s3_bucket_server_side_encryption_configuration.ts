import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/s3_bucket_server_side_encryption_configuration
export const awsS3BucketServerSideEncryptionConfigurationResourceSchema = {
  kind: "resource",
  type: "aws_s3_bucket_server_side_encryption_configuration",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    bucket: { valueType: "string", required: true },
    expected_bucket_owner: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    rule: {
      nestingMode: "list",
      attributes: {
        bucket_key_enabled: { valueType: "bool", optional: true },
      },
      blocks: {
        apply_server_side_encryption_by_default: {
          nestingMode: "list",
          maxItems: 1,
          attributes: {
            kms_master_key_id: { valueType: "string", optional: true },
            sse_algorithm: { valueType: "string", required: true },
          },
        },
      },
    },
  },
} as const satisfies TerraformTypeSchema;
