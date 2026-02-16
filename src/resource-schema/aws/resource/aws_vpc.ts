import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/vpc
export const awsVpcResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_vpc",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    assign_generated_ipv6_cidr_block: { valueType: "bool", optional: true },
    cidr_block: { valueType: "string", optional: true },
    default_network_acl_id: { valueType: "string", computed: true },
    default_route_table_id: { valueType: "string", computed: true },
    default_security_group_id: { valueType: "string", computed: true },
    dhcp_options_id: { valueType: "string", optional: true },
    enable_dns_hostnames: { valueType: "bool", optional: true },
    enable_dns_support: { valueType: "bool", optional: true },
    enable_network_address_usage_metrics: { valueType: "bool", optional: true },
    instance_tenancy: { valueType: "string", optional: true },
    ipv4_ipam_pool_id: { valueType: "string", optional: true },
    ipv4_netmask_length: { valueType: "number", optional: true },
    ipv6_association_id: { valueType: "string", computed: true },
    ipv6_cidr_block: { valueType: "string", optional: true },
    ipv6_cidr_block_network_border_group: {
      valueType: "string",
      optional: true,
    },
    ipv6_ipam_pool_id: { valueType: "string", optional: true },
    ipv6_netmask_length: { valueType: "number", optional: true },
    main_route_table_id: { valueType: "string", computed: true },
    owner_id: { valueType: "string", computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    timeouts: {
      nestingMode: "single",
      attributes: {
        create: { valueType: "string", optional: true },
        update: { valueType: "string", optional: true },
        delete: { valueType: "string", optional: true },
      },
    },
  },
};
