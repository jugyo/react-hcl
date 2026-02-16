import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsS3BucketLifecycleConfigurationResourceSchema = resource(
  "aws_s3_bucket_lifecycle_configuration",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      bucket: attr.string().required(),
      expected_bucket_owner: attr.string().optional().computed(),
      id: attr.string().computed(),
      region: attr.string().optional().computed(),
      transition_default_minimum_object_size: attr
        .string()
        .optional()
        .computed(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      rule: block.list({
        attributes: {
          id: attr.string().required(),
          prefix: attr.string().optional().computed(),
          status: attr.string().required(),
        },
        blocks: {
          abort_incomplete_multipart_upload: block.list({
            attributes: {
              days_after_initiation: attr.number().optional(),
            },
          }),
          expiration: block.list({
            attributes: {
              date: attr.string().optional(),
              days: attr.number().optional().computed(),
              expired_object_delete_marker: attr.bool().optional().computed(),
            },
          }),
          filter: block.list({
            attributes: {
              object_size_greater_than: attr.number().optional().computed(),
              object_size_less_than: attr.number().optional().computed(),
              prefix: attr.string().optional().computed(),
            },
            blocks: {
              and: block.list({
                attributes: {
                  object_size_greater_than: attr.number().optional().computed(),
                  object_size_less_than: attr.number().optional().computed(),
                  prefix: attr.string().optional().computed(),
                  tags: attr.map().optional(),
                },
              }),
              tag: block.list({
                attributes: {
                  key: attr.string().required(),
                  value: attr.string().required(),
                },
              }),
            },
          }),
          noncurrent_version_expiration: block.list({
            attributes: {
              newer_noncurrent_versions: attr.number().optional(),
              noncurrent_days: attr.number().required(),
            },
          }),
          noncurrent_version_transition: block.set({
            attributes: {
              newer_noncurrent_versions: attr.number().optional(),
              noncurrent_days: attr.number().required(),
              storage_class: attr.string().required(),
            },
          }),
          transition: block.set({
            attributes: {
              date: attr.string().optional(),
              days: attr.number().optional().computed(),
              storage_class: attr.string().required(),
            },
          }),
        },
      }),
      timeouts: block.single({
        attributes: {
          create: attr.string().optional(),
          update: attr.string().optional(),
        },
      }),
    },
  },
);
