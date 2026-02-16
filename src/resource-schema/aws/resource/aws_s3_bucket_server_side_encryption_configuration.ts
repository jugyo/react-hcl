import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketServerSideEncryptionConfigurationResourceSchema =
  resource("aws_s3_bucket_server_side_encryption_configuration", {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: attr.string({ required: true }),
      expected_bucket_owner: attr.string({ optional: true }),
      id: attr.string({ optional: true, computed: true }),
      region: attr.string({ optional: true, computed: true }),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: block.set(
        {
          attributes: {
            blocked_encryption_types: attr.list({ optional: true }),
            bucket_key_enabled: attr.bool({ optional: true }),
          },
          blocks: {
            apply_server_side_encryption_by_default: block.single(
              {
                attributes: {
                  kms_master_key_id: attr.string({ optional: true }),
                  sse_algorithm: attr.string({ required: true }),
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
