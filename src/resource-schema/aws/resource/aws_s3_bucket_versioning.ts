import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketVersioningResourceSchema = resource(
  "aws_s3_bucket_versioning",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: attr.string().required(),
      expected_bucket_owner: attr.string().optional(),
      id: attr.string().optional().computed(),
      mfa: attr.string().optional(),
      region: attr.string().optional().computed(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      versioning_configuration: block.single(
        {
          attributes: {
            mfa_delete: attr.string().optional().computed(),
            status: attr.string().required(),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
    },
  },
);
