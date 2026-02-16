import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/security_group
export const awsSecurityGroupResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_security_group",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    description: { valueType: "string", optional: true },
    name: { valueType: "string", optional: true },
    name_prefix: { valueType: "string", optional: true },
    revoke_rules_on_delete: { valueType: "bool", optional: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    vpc_id: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    ingress: {
      nestingMode: "list",
      attributes: {
        cidr_blocks: { valueType: "list", optional: true },
        description: { valueType: "string", optional: true },
        from_port: { valueType: "number", optional: true },
        ipv6_cidr_blocks: { valueType: "list", optional: true },
        prefix_list_ids: { valueType: "list", optional: true },
        protocol: { valueType: "string", required: true },
        security_groups: { valueType: "set", optional: true },
        self: { valueType: "bool", optional: true },
        to_port: { valueType: "number", optional: true },
      },
    },
    egress: {
      nestingMode: "list",
      attributes: {
        cidr_blocks: { valueType: "list", optional: true },
        description: { valueType: "string", optional: true },
        from_port: { valueType: "number", optional: true },
        ipv6_cidr_blocks: { valueType: "list", optional: true },
        prefix_list_ids: { valueType: "list", optional: true },
        protocol: { valueType: "string", required: true },
        security_groups: { valueType: "set", optional: true },
        self: { valueType: "bool", optional: true },
        to_port: { valueType: "number", optional: true },
      },
    },
    timeouts: {
      nestingMode: "single",
      attributes: {
        create: { valueType: "string", optional: true },
        delete: { valueType: "string", optional: true },
      },
    },
  },
};
