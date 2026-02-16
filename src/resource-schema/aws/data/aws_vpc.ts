import { attr, block, data } from "../../dsl";

export const awsVpcDataSchema = data("aws_vpc", {
  attributes: {
    arn: attr.string().computed(),
    cidr_block: attr.string().optional().computed(),
    default: attr.bool().optional().computed(),
    dhcp_options_id: attr.string().optional().computed(),
    enable_dns_hostnames: attr.bool().computed(),
    enable_dns_support: attr.bool().computed(),
    enable_network_address_usage_metrics: attr.bool().computed(),
    id: attr.string().optional().computed(),
    instance_tenancy: attr.string().computed(),
    ipv6_association_id: attr.string().computed(),
    ipv6_cidr_block: attr.string().computed(),
    main_route_table_id: attr.string().computed(),
    owner_id: attr.string().computed(),
    region: attr.string().optional().computed(),
    state: attr.string().optional().computed(),
    tags: attr.map().optional().computed(),
  },
  blocks: {
    cidr_block_associations: block.list({
      attributes: {
        association_id: attr.string().optional(),
        cidr_block: attr.string().optional(),
        state: attr.string().optional(),
      },
    }),
    filter: block.set({
      attributes: {
        name: attr.string().required(),
        values: attr.set().required(),
      },
    }),
    timeouts: block.single({
      attributes: {
        read: attr.string().optional(),
      },
    }),
  },
});
