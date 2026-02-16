import type { TerraformTypeSchema } from "../../types";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/data-sources/availability_zones
export const awsAvailabilityZonesDataSchema: TerraformTypeSchema = {
  kind: "data",
  type: "aws_availability_zones",
  attributes: {
    all_availability_zones: { valueType: "bool", optional: true },
    exclude_names: { valueType: "set", optional: true },
    exclude_zone_ids: { valueType: "set", optional: true },
    group_names: { valueType: "list", computed: true },
    id: { valueType: "string", computed: true },
    names: { valueType: "list", computed: true },
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
  },
};
