import { data } from "../../dsl";

export const awsSubnetsDataSchema = data("aws_subnets", {
  attributes: {
    id: { valueType: "string", optional: true, computed: true },
    ids: { valueType: "list", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    tags: { valueType: "map", optional: true, computed: true },
  },
  blocks: {
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
