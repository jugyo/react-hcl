import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsSubnetResourceSchema = resource("aws_subnet", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    assign_ipv6_address_on_creation: { valueType: "bool", optional: true },
    availability_zone: { valueType: "string", optional: true, computed: true },
    availability_zone_id: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    cidr_block: { valueType: "string", optional: true, computed: true },
    customer_owned_ipv4_pool: { valueType: "string", optional: true },
    enable_dns64: { valueType: "bool", optional: true },
    enable_lni_at_device_index: { valueType: "number", optional: true },
    enable_resource_name_dns_a_record_on_launch: {
      valueType: "bool",
      optional: true,
    },
    enable_resource_name_dns_aaaa_record_on_launch: {
      valueType: "bool",
      optional: true,
    },
    id: { valueType: "string", optional: true, computed: true },
    ipv4_ipam_pool_id: { valueType: "string", optional: true },
    ipv4_netmask_length: { valueType: "number", optional: true },
    ipv6_cidr_block: { valueType: "string", optional: true, computed: true },
    ipv6_cidr_block_association_id: { valueType: "string", computed: true },
    ipv6_ipam_pool_id: { valueType: "string", optional: true },
    ipv6_native: { valueType: "bool", optional: true },
    ipv6_netmask_length: { valueType: "number", optional: true },
    map_customer_owned_ip_on_launch: { valueType: "bool", optional: true },
    map_public_ip_on_launch: { valueType: "bool", optional: true },
    outpost_arn: { valueType: "string", optional: true },
    owner_id: { valueType: "string", computed: true },
    private_dns_hostname_type_on_launch: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    region: { valueType: "string", optional: true, computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", optional: true, computed: true },
    vpc_id: { valueType: "string", required: true },
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
});
