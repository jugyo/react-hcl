import { attr, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsDbSubnetGroupResourceSchema = resource("aws_db_subnet_group", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: attr.string({ computed: true }),
    description: attr.string({ optional: true }),
    id: attr.string({ optional: true, computed: true }),
    name: attr.string({ optional: true, computed: true }),
    name_prefix: attr.string({ optional: true, computed: true }),
    region: attr.string({ optional: true, computed: true }),
    subnet_ids: attr.set({ required: true }),
    supported_network_types: attr.set({ computed: true }),
    tags: attr.map({ optional: true }),
    tags_all: attr.map({ optional: true, computed: true }),
    vpc_id: attr.string({ computed: true }),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
});
