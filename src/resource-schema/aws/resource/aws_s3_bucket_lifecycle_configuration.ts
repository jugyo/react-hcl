import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketLifecycleConfigurationResourceSchema = resource(
  "aws_s3_bucket_lifecycle_configuration",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: { valueType: "string", required: true },
      expected_bucket_owner: {
        valueType: "string",
        optional: true,
        computed: true,
      },
      id: { valueType: "string", computed: true },
      region: { valueType: "string", optional: true, computed: true },
      transition_default_minimum_object_size: {
        valueType: "string",
        optional: true,
        computed: true,
      },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: {
        nestingMode: "list",
        attributes: {
          id: { valueType: "string", required: true },
          prefix: { valueType: "string", optional: true, computed: true },
          status: { valueType: "string", required: true },
        },
        blocks: {
          abort_incomplete_multipart_upload: {
            nestingMode: "list",
            attributes: {
              days_after_initiation: { valueType: "number", optional: true },
            },
          },
          expiration: {
            nestingMode: "list",
            attributes: {
              date: { valueType: "string", optional: true },
              days: { valueType: "number", optional: true, computed: true },
              expired_object_delete_marker: {
                valueType: "bool",
                optional: true,
                computed: true,
              },
            },
          },
          filter: {
            nestingMode: "list",
            attributes: {
              object_size_greater_than: {
                valueType: "number",
                optional: true,
                computed: true,
              },
              object_size_less_than: {
                valueType: "number",
                optional: true,
                computed: true,
              },
              prefix: { valueType: "string", optional: true, computed: true },
            },
            blocks: {
              and: {
                nestingMode: "list",
                attributes: {
                  object_size_greater_than: {
                    valueType: "number",
                    optional: true,
                    computed: true,
                  },
                  object_size_less_than: {
                    valueType: "number",
                    optional: true,
                    computed: true,
                  },
                  prefix: {
                    valueType: "string",
                    optional: true,
                    computed: true,
                  },
                  tags: { valueType: "map", optional: true },
                },
              },
              tag: {
                nestingMode: "list",
                attributes: {
                  key: { valueType: "string", required: true },
                  value: { valueType: "string", required: true },
                },
              },
            },
          },
          noncurrent_version_expiration: {
            nestingMode: "list",
            attributes: {
              newer_noncurrent_versions: {
                valueType: "number",
                optional: true,
              },
              noncurrent_days: { valueType: "number", required: true },
            },
          },
          noncurrent_version_transition: {
            nestingMode: "set",
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
            nestingMode: "set",
            attributes: {
              date: { valueType: "string", optional: true },
              days: { valueType: "number", optional: true, computed: true },
              storage_class: { valueType: "string", required: true },
            },
          },
        },
      },
      timeouts: {
        nestingMode: "single",
        attributes: {
          create: { valueType: "string", optional: true },
          update: { valueType: "string", optional: true },
        },
      },
    },
  },
);
