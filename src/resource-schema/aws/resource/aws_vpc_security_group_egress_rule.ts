import { attr, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsVpcSecurityGroupEgressRuleResourceSchema = resource(
  "aws_vpc_security_group_egress_rule",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      arn: attr.string({ computed: true }),
      cidr_ipv4: attr.string({ optional: true }),
      cidr_ipv6: attr.string({ optional: true }),
      description: attr.string({ optional: true }),
      from_port: attr.number({ optional: true }),
      id: attr.string({ computed: true }),
      ip_protocol: attr.string({ required: true }),
      prefix_list_id: attr.string({ optional: true }),
      referenced_security_group_id: attr.string({ optional: true }),
      region: attr.string({ optional: true, computed: true }),
      security_group_id: attr.string({ required: true }),
      security_group_rule_id: attr.string({ computed: true }),
      tags: attr.map({ optional: true }),
      tags_all: attr.map({ computed: true }),
      to_port: attr.number({ optional: true }),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
    },
  },
);
