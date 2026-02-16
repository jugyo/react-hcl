import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketServerSideEncryptionConfigurationResourceSchema =
  resource("aws_s3_bucket_server_side_encryption_configuration", {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: { valueType: "string", required: true },
      expected_bucket_owner: { valueType: "string", optional: true },
      id: { valueType: "string", optional: true, computed: true },
      region: { valueType: "string", optional: true, computed: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: {
        nestingMode: "set",
        minItems: 1,
        attributes: {
          blocked_encryption_types: { valueType: "list", optional: true },
          bucket_key_enabled: { valueType: "bool", optional: true },
        },
        blocks: {
          apply_server_side_encryption_by_default: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              kms_master_key_id: { valueType: "string", optional: true },
              sse_algorithm: { valueType: "string", required: true },
            },
          },
        },
      },
    },
  });
