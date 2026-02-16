import { data } from "../../dsl";

export const awsVpcDataSchema = data("aws_vpc", {
  attributes: {
    arn: { valueType: "string", computed: true },
    cidr_block: { valueType: "string", optional: true, computed: true },
    default: { valueType: "bool", optional: true, computed: true },
    dhcp_options_id: { valueType: "string", optional: true, computed: true },
    enable_dns_hostnames: { valueType: "bool", computed: true },
    enable_dns_support: { valueType: "bool", computed: true },
    enable_network_address_usage_metrics: { valueType: "bool", computed: true },
    id: { valueType: "string", optional: true, computed: true },
    instance_tenancy: { valueType: "string", computed: true },
    ipv6_association_id: { valueType: "string", computed: true },
    ipv6_cidr_block: { valueType: "string", computed: true },
    main_route_table_id: { valueType: "string", computed: true },
    owner_id: { valueType: "string", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    state: { valueType: "string", optional: true, computed: true },
    tags: { valueType: "map", optional: true, computed: true },
  },
  blocks: {
    cidr_block_associations: {
      nestingMode: "list",
      attributes: {
        association_id: { valueType: "string", optional: true },
        cidr_block: { valueType: "string", optional: true },
        state: { valueType: "string", optional: true },
      },
    },
    filter: {
      nestingMode: "set",
      attributes: {
        name: { valueType: "string", required: true },
        values: { valueType: "set", required: true },
      },
    },
    timeouts: {
      nestingMode: "single",
      attributes: {
        read: { valueType: "string", optional: true },
      },
    },
  },
});
