import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketServerSideEncryptionConfigurationResourceSchema =
  resource("aws_s3_bucket_server_side_encryption_configuration", {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: attr.string().required(),
      expected_bucket_owner: attr.string().optional(),
      id: attr.string().optional().computed(),
      region: attr.string().optional().computed(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: block.set(
        {
          attributes: {
            blocked_encryption_types: attr.list().optional(),
            bucket_key_enabled: attr.bool().optional(),
          },
          blocks: {
            apply_server_side_encryption_by_default: block.single(
              {
                attributes: {
                  kms_master_key_id: attr.string().optional(),
                  sse_algorithm: attr.string().required(),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { minItems: 1 },
      ),
    },
  });
