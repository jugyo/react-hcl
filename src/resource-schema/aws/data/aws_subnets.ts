import { attr, block, data } from "../../dsl";

export const awsSubnetsDataSchema = data("aws_subnets", {
  attributes: {
    id: attr.string({ optional: true, computed: true }),
    ids: attr.list({ computed: true }),
    region: attr.string({ optional: true, computed: true }),
    tags: attr.map({ optional: true, computed: true }),
  },
  blocks: {
    filter: block.set({
      attributes: {
        name: attr.string({ required: true }),
        values: attr.set({ required: true }),
      },
    }),
    timeouts: block.single({
      attributes: {
        read: attr.string({ optional: true }),
      },
    }),
  },
});
