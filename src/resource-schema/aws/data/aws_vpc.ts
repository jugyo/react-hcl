import type { TerraformTypeSchema } from "../../types";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/data-sources/vpc
export const awsVpcDataSchema: TerraformTypeSchema = {
  kind: "data",
  type: "aws_vpc",
  attributes: {
    arn: { valueType: "string", computed: true },
    cidr_block: { valueType: "string", computed: true },
    default: { valueType: "bool", optional: true },
    dhcp_options_id: { valueType: "string", computed: true },
    enable_dns_hostnames: { valueType: "bool", computed: true },
    enable_dns_support: { valueType: "bool", computed: true },
    id: { valueType: "string", optional: true },
    ipv6_association_id: { valueType: "string", computed: true },
    ipv6_cidr_block: { valueType: "string", computed: true },
    main_route_table_id: { valueType: "string", computed: true },
    owner_id: { valueType: "string", computed: true },
    state: { valueType: "string", optional: true },
    tags: { valueType: "map", optional: true },
  },
  blocks: {
    filter: {
      nestingMode: "set",
      attributes: {
        name: { valueType: "string", required: true },
        values: { valueType: "set", required: true },
      },
    },
  },
};
