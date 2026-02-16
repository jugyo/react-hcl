import { attr, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsDbSubnetGroupResourceSchema = resource("aws_db_subnet_group", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: attr.string().computed(),
    description: attr.string().optional(),
    id: attr.string().optional().computed(),
    name: attr.string().optional().computed(),
    name_prefix: attr.string().optional().computed(),
    region: attr.string().optional().computed(),
    subnet_ids: attr.set().required(),
    supported_network_types: attr.set().computed(),
    tags: attr.map().optional(),
    tags_all: attr.map().optional().computed(),
    vpc_id: attr.string().computed(),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
});
