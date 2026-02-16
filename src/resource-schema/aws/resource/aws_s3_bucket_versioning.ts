import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/s3_bucket_versioning
export const awsS3BucketVersioningResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_s3_bucket_versioning",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    bucket: { valueType: "string", required: true },
    expected_bucket_owner: { valueType: "string", optional: true },
    mfa: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    versioning_configuration: {
      nestingMode: "list",
      maxItems: 1,
      attributes: {
        mfa_delete: { valueType: "string", optional: true },
        status: { valueType: "string", required: true },
      },
    },
  },
};
