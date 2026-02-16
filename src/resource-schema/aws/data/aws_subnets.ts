import type { TerraformTypeSchema } from "../../types";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/data-sources/subnets
export const awsSubnetsDataSchema: TerraformTypeSchema = {
  kind: "data",
  type: "aws_subnets",
  attributes: {
    id: { valueType: "string", computed: true },
    ids: { valueType: "list", computed: true },
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
