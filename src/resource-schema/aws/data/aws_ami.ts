import type { TerraformTypeSchema } from "../../types";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/data-sources/ami
export const awsAmiDataSchema: TerraformTypeSchema = {
  kind: "data",
  type: "aws_ami",
  attributes: {
    architecture: { valueType: "string", computed: true },
    arn: { valueType: "string", computed: true },
    creation_date: { valueType: "string", computed: true },
    deprecation_time: { valueType: "string", computed: true },
    description: { valueType: "string", computed: true },
    executable_users: { valueType: "list", optional: true },
    hypervisor: { valueType: "string", computed: true },
    image_id: { valueType: "string", optional: true },
    image_location: { valueType: "string", computed: true },
    image_owner_alias: { valueType: "string", computed: true },
    image_type: { valueType: "string", computed: true },
    include_deprecated: { valueType: "bool", optional: true },
    kernel_id: { valueType: "string", computed: true },
    most_recent: { valueType: "bool", optional: true },
    name: { valueType: "string", computed: true },
    owners: { valueType: "list", required: true },
    platform_details: { valueType: "string", computed: true },
    product_codes: { valueType: "set", computed: true },
    public: { valueType: "bool", computed: true },
    root_device_name: { valueType: "string", computed: true },
    root_device_type: { valueType: "string", computed: true },
    root_snapshot_id: { valueType: "string", computed: true },
    sriov_net_support: { valueType: "string", computed: true },
    state: { valueType: "string", computed: true },
    state_reason: { valueType: "string", computed: true },
    tags: { valueType: "map", optional: true },
    usage_operation: { valueType: "string", computed: true },
    virtualization_type: { valueType: "string", computed: true },
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
