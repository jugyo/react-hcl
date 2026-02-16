import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsSubnetResourceSchema = resource("aws_subnet", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: attr.string().computed(),
    assign_ipv6_address_on_creation: attr.bool().optional(),
    availability_zone: attr.string().optional().computed(),
    availability_zone_id: attr.string().optional().computed(),
    cidr_block: attr.string().optional().computed(),
    customer_owned_ipv4_pool: attr.string().optional(),
    enable_dns64: attr.bool().optional(),
    enable_lni_at_device_index: attr.number().optional(),
    enable_resource_name_dns_a_record_on_launch: attr.bool().optional(),
    enable_resource_name_dns_aaaa_record_on_launch: attr.bool().optional(),
    id: attr.string().optional().computed(),
    ipv4_ipam_pool_id: attr.string().optional(),
    ipv4_netmask_length: attr.number().optional(),
    ipv6_cidr_block: attr.string().optional().computed(),
    ipv6_cidr_block_association_id: attr.string().computed(),
    ipv6_ipam_pool_id: attr.string().optional(),
    ipv6_native: attr.bool().optional(),
    ipv6_netmask_length: attr.number().optional(),
    map_customer_owned_ip_on_launch: attr.bool().optional(),
    map_public_ip_on_launch: attr.bool().optional(),
    outpost_arn: attr.string().optional(),
    owner_id: attr.string().computed(),
    private_dns_hostname_type_on_launch: attr.string().optional().computed(),
    region: attr.string().optional().computed(),
    tags: attr.map().optional(),
    tags_all: attr.map().optional().computed(),
    vpc_id: attr.string().required(),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    timeouts: block.single({
      attributes: {
        create: attr.string().optional(),
        delete: attr.string().optional(),
      },
    }),
  },
});
