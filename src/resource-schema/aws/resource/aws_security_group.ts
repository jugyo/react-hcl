import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsSecurityGroupResourceSchema = resource("aws_security_group", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    description: { valueType: "string", optional: true },
    id: { valueType: "string", optional: true, computed: true },
    name: { valueType: "string", optional: true, computed: true },
    name_prefix: { valueType: "string", optional: true, computed: true },
    owner_id: { valueType: "string", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    revoke_rules_on_delete: { valueType: "bool", optional: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", optional: true, computed: true },
    vpc_id: { valueType: "string", optional: true, computed: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    egress: {
      nestingMode: "set",
      attributes: {
        cidr_blocks: { valueType: "list", optional: true },
        description: { valueType: "string", optional: true },
        from_port: { valueType: "number", optional: true },
        ipv6_cidr_blocks: { valueType: "list", optional: true },
        prefix_list_ids: { valueType: "list", optional: true },
        protocol: { valueType: "string", optional: true },
        security_groups: { valueType: "set", optional: true },
        self: { valueType: "bool", optional: true },
        to_port: { valueType: "number", optional: true },
      },
    },
    ingress: {
      nestingMode: "set",
      attributes: {
        cidr_blocks: { valueType: "list", optional: true },
        description: { valueType: "string", optional: true },
        from_port: { valueType: "number", optional: true },
        ipv6_cidr_blocks: { valueType: "list", optional: true },
        prefix_list_ids: { valueType: "list", optional: true },
        protocol: { valueType: "string", optional: true },
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
});
