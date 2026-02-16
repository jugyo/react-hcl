import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsDbSubnetGroupResourceSchema = resource("aws_db_subnet_group", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    description: { valueType: "string", optional: true },
    id: { valueType: "string", optional: true, computed: true },
    name: { valueType: "string", optional: true, computed: true },
    name_prefix: { valueType: "string", optional: true, computed: true },
    region: { valueType: "string", optional: true, computed: true },
    subnet_ids: { valueType: "set", required: true },
    supported_network_types: { valueType: "set", computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", optional: true, computed: true },
    vpc_id: { valueType: "string", computed: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
});
