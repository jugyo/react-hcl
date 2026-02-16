import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/subnet
export const awsSubnetResourceSchema = {
  kind: "resource",
  type: "aws_subnet",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    assign_ipv6_address_on_creation: { valueType: "bool", optional: true },
    availability_zone: { valueType: "string", optional: true },
    availability_zone_id: { valueType: "string", optional: true },
    cidr_block: { valueType: "string", optional: true },
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
    ipv6_cidr_block: { valueType: "string", optional: true },
    ipv6_native: { valueType: "bool", optional: true },
    map_customer_owned_ip_on_launch: { valueType: "bool", optional: true },
    map_public_ip_on_launch: { valueType: "bool", optional: true },
    outpost_arn: { valueType: "string", optional: true },
    private_dns_hostname_type_on_launch: {
      valueType: "string",
      optional: true,
    },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    vpc_id: { valueType: "string", required: true },
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
} as const satisfies TerraformTypeSchema;
