import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsSecurityGroupResourceSchema = resource("aws_security_group", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: attr.string().computed(),
    description: attr.string().optional(),
    id: attr.string().optional().computed(),
    name: attr.string().optional().computed(),
    name_prefix: attr.string().optional().computed(),
    owner_id: attr.string().computed(),
    region: attr.string().optional().computed(),
    revoke_rules_on_delete: attr.bool().optional(),
    tags: attr.map().optional(),
    tags_all: attr.map().optional().computed(),
    vpc_id: attr.string().optional().computed(),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    egress: block.set({
      attributes: {
        cidr_blocks: attr.list().optional(),
        description: attr.string().optional(),
        from_port: attr.number().optional(),
        ipv6_cidr_blocks: attr.list().optional(),
        prefix_list_ids: attr.list().optional(),
        protocol: attr.string().optional(),
        security_groups: attr.set().optional(),
        self: attr.bool().optional(),
        to_port: attr.number().optional(),
      },
    }),
    ingress: block.set({
      attributes: {
        cidr_blocks: attr.list().optional(),
        description: attr.string().optional(),
        from_port: attr.number().optional(),
        ipv6_cidr_blocks: attr.list().optional(),
        prefix_list_ids: attr.list().optional(),
        protocol: attr.string().optional(),
        security_groups: attr.set().optional(),
        self: attr.bool().optional(),
        to_port: attr.number().optional(),
      },
    }),
    timeouts: block.single({
      attributes: {
        create: attr.string().optional(),
        delete: attr.string().optional(),
      },
    }),
  },
});
