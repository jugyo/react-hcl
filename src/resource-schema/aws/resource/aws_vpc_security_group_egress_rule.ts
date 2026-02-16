import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/vpc_security_group_egress_rule
export const awsVpcSecurityGroupEgressRuleResourceSchema = {
  kind: "resource",
  type: "aws_vpc_security_group_egress_rule",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    cidr_ipv4: { valueType: "string", optional: true },
    cidr_ipv6: { valueType: "string", optional: true },
    description: { valueType: "string", optional: true },
    from_port: { valueType: "number", optional: true },
    ip_protocol: { valueType: "string", required: true },
    prefix_list_id: { valueType: "string", optional: true },
    referenced_security_group_id: { valueType: "string", optional: true },
    security_group_id: { valueType: "string", required: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    to_port: { valueType: "number", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    timeouts: {
      nestingMode: "single",
      attributes: {
        create: { valueType: "string", optional: true },
        delete: { valueType: "string", optional: true },
      },
    },
  },
} as const satisfies TerraformTypeSchema;
