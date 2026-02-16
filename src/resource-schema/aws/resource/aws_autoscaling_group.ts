import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/autoscaling_group
export const awsAutoscalingGroupResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_autoscaling_group",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    arn: { valueType: "string", computed: true },
    availability_zones: { valueType: "set", optional: true },
    default_cooldown: { valueType: "number", optional: true },
    desired_capacity: { valueType: "number", optional: true },
    force_delete: { valueType: "bool", optional: true },
    health_check_grace_period: { valueType: "number", optional: true },
    health_check_type: { valueType: "string", optional: true },
    launch_configuration: { valueType: "string", optional: true },
    load_balancers: { valueType: "set", optional: true },
    max_size: { valueType: "number", required: true },
    min_size: { valueType: "number", required: true },
    name: { valueType: "string", optional: true },
    name_prefix: { valueType: "string", optional: true },
    protect_from_scale_in: { valueType: "bool", optional: true },
    service_linked_role_arn: { valueType: "string", optional: true },
    target_group_arns: { valueType: "set", optional: true },
    termination_policies: { valueType: "list", optional: true },
    vpc_zone_identifier: { valueType: "set", optional: true },
    wait_for_capacity_timeout: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    initial_lifecycle_hook: {
      nestingMode: "list",
      attributes: {
        default_result: { valueType: "string", optional: true },
        heartbeat_timeout: { valueType: "number", optional: true },
        lifecycle_transition: { valueType: "string", required: true },
        name: { valueType: "string", required: true },
        notification_metadata: { valueType: "string", optional: true },
        notification_target_arn: { valueType: "string", optional: true },
        role_arn: { valueType: "string", optional: true },
      },
    },
    instance_maintenance_policy: {
      nestingMode: "single",
      attributes: {
        max_healthy_percentage: { valueType: "number", optional: true },
        min_healthy_percentage: { valueType: "number", optional: true },
      },
    },
    launch_template: {
      nestingMode: "single",
      attributes: {
        id: { valueType: "string", optional: true },
        name: { valueType: "string", optional: true },
        version: { valueType: "string", optional: true },
      },
    },
    mixed_instances_policy: {
      nestingMode: "single",
      attributes: {},
      blocks: {
        instances_distribution: {
          nestingMode: "single",
          attributes: {
            on_demand_allocation_strategy: {
              valueType: "string",
              optional: true,
            },
            on_demand_base_capacity: { valueType: "number", optional: true },
            on_demand_percentage_above_base_capacity: {
              valueType: "number",
              optional: true,
            },
            spot_allocation_strategy: { valueType: "string", optional: true },
            spot_instance_pools: { valueType: "number", optional: true },
            spot_max_price: { valueType: "string", optional: true },
          },
        },
        launch_template: {
          nestingMode: "single",
          attributes: {},
          blocks: {
            launch_template_specification: {
              nestingMode: "single",
              attributes: {
                launch_template_id: { valueType: "string", optional: true },
                launch_template_name: { valueType: "string", optional: true },
                version: { valueType: "string", optional: true },
              },
            },
            override: {
              nestingMode: "list",
              attributes: {
                instance_type: { valueType: "string", optional: true },
                weighted_capacity: { valueType: "string", optional: true },
              },
            },
          },
        },
      },
    },
    tag: {
      nestingMode: "set",
      attributes: {
        key: { valueType: "string", required: true },
        value: { valueType: "string", required: true },
        propagate_at_launch: { valueType: "bool", required: true },
      },
    },
    warm_pool: {
      nestingMode: "single",
      attributes: {
        instance_reuse_policy: { valueType: "any", optional: true },
        max_group_prepared_capacity: { valueType: "number", optional: true },
        min_size: { valueType: "number", optional: true },
        pool_state: { valueType: "string", optional: true },
      },
    },
  },
};
