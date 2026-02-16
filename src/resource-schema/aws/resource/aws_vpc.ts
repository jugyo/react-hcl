import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsVpcResourceSchema = resource("aws_vpc", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    assign_generated_ipv6_cidr_block: { valueType: "bool", optional: true },
    cidr_block: { valueType: "string", optional: true, computed: true },
    default_network_acl_id: { valueType: "string", computed: true },
    default_route_table_id: { valueType: "string", computed: true },
    default_security_group_id: { valueType: "string", computed: true },
    dhcp_options_id: { valueType: "string", computed: true },
    enable_dns_hostnames: { valueType: "bool", optional: true, computed: true },
    enable_dns_support: { valueType: "bool", optional: true },
    enable_network_address_usage_metrics: {
      valueType: "bool",
      optional: true,
      computed: true,
    },
    id: { valueType: "string", optional: true, computed: true },
    instance_tenancy: { valueType: "string", optional: true },
    ipv4_ipam_pool_id: { valueType: "string", optional: true },
    ipv4_netmask_length: { valueType: "number", optional: true },
    ipv6_association_id: { valueType: "string", computed: true },
    ipv6_cidr_block: { valueType: "string", optional: true, computed: true },
    ipv6_cidr_block_network_border_group: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    ipv6_ipam_pool_id: { valueType: "string", optional: true },
    ipv6_netmask_length: { valueType: "number", optional: true },
    main_route_table_id: { valueType: "string", computed: true },
    owner_id: { valueType: "string", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", optional: true, computed: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
});
