import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/db_subnet_group
export const awsDbSubnetGroupResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_db_subnet_group",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    description: { valueType: "string", optional: true },
    name: { valueType: "string", optional: true },
    name_prefix: { valueType: "string", optional: true },
    subnet_ids: { valueType: "set", required: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    vpc_id: { valueType: "string", computed: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
  },
};
