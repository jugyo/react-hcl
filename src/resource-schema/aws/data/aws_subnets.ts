import { attr, block, data } from "../../dsl";

export const awsSubnetsDataSchema = data("aws_subnets", {
  attributes: {
    id: attr.string().optional().computed(),
    ids: attr.list().computed(),
    region: attr.string().optional().computed(),
    tags: attr.map().optional().computed(),
  },
  blocks: {
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
