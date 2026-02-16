import { data } from "../../dsl";

export const awsAvailabilityZonesDataSchema = data("aws_availability_zones", {
  attributes: {
    all_availability_zones: { valueType: "bool", optional: true },
    exclude_names: { valueType: "set", optional: true },
    exclude_zone_ids: { valueType: "set", optional: true },
    group_names: { valueType: "set", computed: true },
    id: { valueType: "string", optional: true, computed: true },
    names: { valueType: "list", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    state: { valueType: "string", optional: true },
    zone_ids: { valueType: "list", computed: true },
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
