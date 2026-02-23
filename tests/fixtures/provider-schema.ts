import { attr, block, data, resource } from "../../src/provider-schema/dsl";

export const TEST_AWS_RESOURCE_SCHEMAS = {
  aws_instance: resource("aws_instance", {
    attributes: {
      instance_type: attr.string({ optional: true }),
    },
    blocks: {
      lifecycle: block.single({
        attributes: {
          prevent_destroy: attr.bool({ optional: true }),
          create_before_destroy: attr.bool({ optional: true }),
        },
      }),
      root_block_device: block.single({
        attributes: {
          volume_size: attr.number({ optional: true }),
        },
      }),
    },
  }),
  aws_security_group: resource("aws_security_group", {
    attributes: {},
    blocks: {
      ingress: block.list({
        attributes: {
          from_port: attr.number({ optional: true }),
          to_port: attr.number({ optional: true }),
          protocol: attr.string({ optional: true }),
          cidr_blocks: attr.list({ optional: true }),
        },
      }),
    },
  }),
  aws_cloudwatch_metric_alarm: resource("aws_cloudwatch_metric_alarm", {
    attributes: {},
    blocks: {
      metric_query: block.list({
        attributes: {
          id: attr.string({ required: true }),
          expression: attr.string({ optional: true }),
          return_data: attr.bool({ optional: true }),
        },
        blocks: {
          metric: block.single({
            attributes: {
              metric_name: attr.string({ required: true }),
              namespace: attr.string({ required: true }),
            },
          }),
        },
      }),
    },
  }),
};

export const TEST_AWS_DATA_SCHEMAS = {
  aws_ami: data("aws_ami", {
    attributes: {
      owners: attr.list({ optional: true }),
      most_recent: attr.bool({ optional: true }),
    },
    blocks: {
      filter: block.set({
        attributes: {
          name: attr.string({ required: true }),
          values: attr.set({ required: true }),
        },
      }),
    },
  }),
};
