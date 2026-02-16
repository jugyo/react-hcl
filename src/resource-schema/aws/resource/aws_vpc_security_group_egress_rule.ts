import { attr, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsVpcSecurityGroupEgressRuleResourceSchema = resource(
  "aws_vpc_security_group_egress_rule",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      arn: attr.string().computed(),
      cidr_ipv4: attr.string().optional(),
      cidr_ipv6: attr.string().optional(),
      description: attr.string().optional(),
      from_port: attr.number().optional(),
      id: attr.string().computed(),
      ip_protocol: attr.string().required(),
      prefix_list_id: attr.string().optional(),
      referenced_security_group_id: attr.string().optional(),
      region: attr.string().optional().computed(),
      security_group_id: attr.string().required(),
      security_group_rule_id: attr.string().computed(),
      tags: attr.map().optional(),
      tags_all: attr.map().computed(),
      to_port: attr.number().optional(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
    },
  },
);
