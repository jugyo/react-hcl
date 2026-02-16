import { attr, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsVpcResourceSchema = resource("aws_vpc", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: attr.string().computed(),
    assign_generated_ipv6_cidr_block: attr.bool().optional(),
    cidr_block: attr.string().optional().computed(),
    default_network_acl_id: attr.string().computed(),
    default_route_table_id: attr.string().computed(),
    default_security_group_id: attr.string().computed(),
    dhcp_options_id: attr.string().computed(),
    enable_dns_hostnames: attr.bool().optional().computed(),
    enable_dns_support: attr.bool().optional(),
    enable_network_address_usage_metrics: attr.bool().optional().computed(),
    id: attr.string().optional().computed(),
    instance_tenancy: attr.string().optional(),
    ipv4_ipam_pool_id: attr.string().optional(),
    ipv4_netmask_length: attr.number().optional(),
    ipv6_association_id: attr.string().computed(),
    ipv6_cidr_block: attr.string().optional().computed(),
    ipv6_cidr_block_network_border_group: attr.string().optional().computed(),
    ipv6_ipam_pool_id: attr.string().optional(),
    ipv6_netmask_length: attr.number().optional(),
    main_route_table_id: attr.string().computed(),
    owner_id: attr.string().computed(),
    region: attr.string().optional().computed(),
    tags: attr.map().optional(),
    tags_all: attr.map().optional().computed(),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
});
