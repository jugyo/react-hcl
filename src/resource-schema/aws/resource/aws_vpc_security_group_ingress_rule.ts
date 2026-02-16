import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsVpcSecurityGroupIngressRuleResourceSchema = resource(
  "aws_vpc_security_group_ingress_rule",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      arn: { valueType: "string", computed: true },
      cidr_ipv4: { valueType: "string", optional: true },
      cidr_ipv6: { valueType: "string", optional: true },
      description: { valueType: "string", optional: true },
      from_port: { valueType: "number", optional: true },
      id: { valueType: "string", computed: true },
      ip_protocol: { valueType: "string", required: true },
      prefix_list_id: { valueType: "string", optional: true },
      referenced_security_group_id: { valueType: "string", optional: true },
      region: { valueType: "string", optional: true, computed: true },
      security_group_id: { valueType: "string", required: true },
      security_group_rule_id: { valueType: "string", computed: true },
      tags: { valueType: "map", optional: true },
      tags_all: { valueType: "map", computed: true },
      to_port: { valueType: "number", optional: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
    },
  },
);
