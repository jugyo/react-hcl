import { attr, block, data } from "../../dsl";

export const awsAvailabilityZonesDataSchema = data("aws_availability_zones", {
  attributes: {
    all_availability_zones: attr.bool().optional(),
    exclude_names: attr.set().optional(),
    exclude_zone_ids: attr.set().optional(),
    group_names: attr.set().computed(),
    id: attr.string().optional().computed(),
    names: attr.list().computed(),
    region: attr.string().optional().computed(),
    state: attr.string().optional(),
    zone_ids: attr.list().computed(),
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
