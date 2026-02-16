import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketVersioningResourceSchema = resource(
  "aws_s3_bucket_versioning",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: { valueType: "string", required: true },
      expected_bucket_owner: { valueType: "string", optional: true },
      id: { valueType: "string", optional: true, computed: true },
      mfa: { valueType: "string", optional: true },
      region: { valueType: "string", optional: true, computed: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      versioning_configuration: {
        nestingMode: "single",
        minItems: 1,
        maxItems: 1,
        attributes: {
          mfa_delete: { valueType: "string", optional: true, computed: true },
          status: { valueType: "string", required: true },
        },
      },
    },
  },
);
