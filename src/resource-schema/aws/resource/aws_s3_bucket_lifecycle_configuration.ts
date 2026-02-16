import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/s3_bucket_lifecycle_configuration
export const awsS3BucketLifecycleConfigurationResourceSchema: TerraformTypeSchema =
  {
    kind: "resource",
    type: "aws_s3_bucket_lifecycle_configuration",
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: { valueType: "string", required: true },
      expected_bucket_owner: { valueType: "string", optional: true },
      transition_default_minimum_object_size: {
        valueType: "string",
        optional: true,
      },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: {
        nestingMode: "list",
        attributes: {
          id: { valueType: "string", optional: true },
          status: { valueType: "string", required: true },
        },
        blocks: {
          abort_incomplete_multipart_upload: {
            nestingMode: "single",
            attributes: {
              days_after_initiation: { valueType: "number", optional: true },
            },
          },
          expiration: {
            nestingMode: "list",
            maxItems: 1,
            attributes: {
              date: { valueType: "string", optional: true },
              days: { valueType: "number", optional: true },
              expired_object_delete_marker: {
                valueType: "bool",
                optional: true,
              },
            },
          },
          filter: {
            nestingMode: "list",
            maxItems: 1,
            attributes: {
              object_size_greater_than: { valueType: "number", optional: true },
              object_size_less_than: { valueType: "number", optional: true },
              prefix: { valueType: "string", optional: true },
            },
            blocks: {
              and: {
                nestingMode: "single",
                attributes: {
                  object_size_greater_than: {
                    valueType: "number",
                    optional: true,
                  },
                  object_size_less_than: {
                    valueType: "number",
                    optional: true,
                  },
                  prefix: { valueType: "string", optional: true },
                  tags: { valueType: "map", optional: true },
                },
              },
              tag: {
                nestingMode: "single",
                attributes: {
                  key: { valueType: "string", required: true },
                  value: { valueType: "string", required: true },
                },
              },
            },
          },
          noncurrent_version_expiration: {
            nestingMode: "list",
            maxItems: 1,
            attributes: {
              newer_noncurrent_versions: {
                valueType: "number",
                optional: true,
              },
              noncurrent_days: { valueType: "number", required: true },
            },
          },
          noncurrent_version_transition: {
            nestingMode: "list",
            attributes: {
              newer_noncurrent_versions: {
                valueType: "number",
                optional: true,
              },
              noncurrent_days: { valueType: "number", required: true },
              storage_class: { valueType: "string", required: true },
            },
          },
          transition: {
            nestingMode: "list",
            attributes: {
              date: { valueType: "string", optional: true },
              days: { valueType: "number", optional: true },
              storage_class: { valueType: "string", required: true },
            },
          },
        },
      },
    },
  };
