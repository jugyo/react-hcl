import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketVersioningResourceSchema = resource(
  "aws_s3_bucket_versioning",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: attr.string({ required: true }),
      expected_bucket_owner: attr.string({ optional: true }),
      id: attr.string({ optional: true, computed: true }),
      mfa: attr.string({ optional: true }),
      region: attr.string({ optional: true, computed: true }),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      versioning_configuration: block.single(
        {
          attributes: {
            mfa_delete: attr.string({ optional: true, computed: true }),
            status: attr.string({ required: true }),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
    },
  },
);
