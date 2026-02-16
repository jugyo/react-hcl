import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsAutoscalingGroupResourceSchema = resource(
  "aws_autoscaling_group",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      arn: { valueType: "string", computed: true },
      availability_zones: { valueType: "set", optional: true, computed: true },
      capacity_rebalance: { valueType: "bool", optional: true },
      context: { valueType: "string", optional: true },
      default_cooldown: { valueType: "number", optional: true, computed: true },
      default_instance_warmup: { valueType: "number", optional: true },
      desired_capacity: { valueType: "number", optional: true, computed: true },
      desired_capacity_type: { valueType: "string", optional: true },
      enabled_metrics: { valueType: "set", optional: true },
      force_delete: { valueType: "bool", optional: true },
      force_delete_warm_pool: { valueType: "bool", optional: true },
      health_check_grace_period: { valueType: "number", optional: true },
      health_check_type: {
        valueType: "string",
        optional: true,
        computed: true,
      },
      id: { valueType: "string", optional: true, computed: true },
      ignore_failed_scaling_activities: { valueType: "bool", optional: true },
      launch_configuration: { valueType: "string", optional: true },
      load_balancers: { valueType: "set", optional: true, computed: true },
      max_instance_lifetime: { valueType: "number", optional: true },
      max_size: { valueType: "number", required: true },
      metrics_granularity: { valueType: "string", optional: true },
      min_elb_capacity: { valueType: "number", optional: true },
      min_size: { valueType: "number", required: true },
      name: { valueType: "string", optional: true, computed: true },
      name_prefix: { valueType: "string", optional: true, computed: true },
      placement_group: { valueType: "string", optional: true },
      predicted_capacity: { valueType: "number", computed: true },
      protect_from_scale_in: { valueType: "bool", optional: true },
      region: { valueType: "string", optional: true, computed: true },
      service_linked_role_arn: {
        valueType: "string",
        optional: true,
        computed: true,
      },
      suspended_processes: { valueType: "set", optional: true },
      target_group_arns: { valueType: "set", optional: true, computed: true },
      termination_policies: { valueType: "list", optional: true },
      vpc_zone_identifier: { valueType: "set", optional: true, computed: true },
      wait_for_capacity_timeout: { valueType: "string", optional: true },
      wait_for_elb_capacity: { valueType: "number", optional: true },
      warm_pool_size: { valueType: "number", computed: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      availability_zone_distribution: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          capacity_distribution_strategy: {
            valueType: "string",
            optional: true,
          },
        },
      },
      capacity_reservation_specification: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          capacity_reservation_preference: {
            valueType: "string",
            optional: true,
            computed: true,
          },
        },
        blocks: {
          capacity_reservation_target: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              capacity_reservation_ids: { valueType: "list", optional: true },
              capacity_reservation_resource_group_arns: {
                valueType: "list",
                optional: true,
              },
            },
          },
        },
      },
      initial_lifecycle_hook: {
        nestingMode: "set",
        attributes: {
          default_result: {
            valueType: "string",
            optional: true,
            computed: true,
          },
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
        maxItems: 1,
        attributes: {
          max_healthy_percentage: { valueType: "number", required: true },
          min_healthy_percentage: { valueType: "number", required: true },
        },
      },
      instance_refresh: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          strategy: { valueType: "string", required: true },
          triggers: { valueType: "set", optional: true },
        },
        blocks: {
          preferences: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              auto_rollback: { valueType: "bool", optional: true },
              checkpoint_delay: { valueType: "string", optional: true },
              checkpoint_percentages: { valueType: "list", optional: true },
              instance_warmup: { valueType: "string", optional: true },
              max_healthy_percentage: { valueType: "number", optional: true },
              min_healthy_percentage: { valueType: "number", optional: true },
              scale_in_protected_instances: {
                valueType: "string",
                optional: true,
              },
              skip_matching: { valueType: "bool", optional: true },
              standby_instances: { valueType: "string", optional: true },
            },
            blocks: {
              alarm_specification: {
                nestingMode: "single",
                maxItems: 1,
                attributes: {
                  alarms: { valueType: "list", optional: true },
                },
              },
            },
          },
        },
      },
      launch_template: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          id: { valueType: "string", optional: true, computed: true },
          name: { valueType: "string", optional: true, computed: true },
          version: { valueType: "string", optional: true, computed: true },
        },
      },
      mixed_instances_policy: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {},
        blocks: {
          instances_distribution: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              on_demand_allocation_strategy: {
                valueType: "string",
                optional: true,
                computed: true,
              },
              on_demand_base_capacity: {
                valueType: "number",
                optional: true,
                computed: true,
              },
              on_demand_percentage_above_base_capacity: {
                valueType: "number",
                optional: true,
                computed: true,
              },
              spot_allocation_strategy: {
                valueType: "string",
                optional: true,
                computed: true,
              },
              spot_instance_pools: {
                valueType: "number",
                optional: true,
                computed: true,
              },
              spot_max_price: { valueType: "string", optional: true },
            },
          },
          launch_template: {
            nestingMode: "single",
            minItems: 1,
            maxItems: 1,
            attributes: {},
            blocks: {
              launch_template_specification: {
                nestingMode: "single",
                minItems: 1,
                maxItems: 1,
                attributes: {
                  launch_template_id: {
                    valueType: "string",
                    optional: true,
                    computed: true,
                  },
                  launch_template_name: {
                    valueType: "string",
                    optional: true,
                    computed: true,
                  },
                  version: {
                    valueType: "string",
                    optional: true,
                    computed: true,
                  },
                },
              },
              override: {
                nestingMode: "list",
                attributes: {
                  instance_type: { valueType: "string", optional: true },
                  weighted_capacity: { valueType: "string", optional: true },
                },
                blocks: {
                  instance_requirements: {
                    nestingMode: "single",
                    maxItems: 1,
                    attributes: {
                      accelerator_manufacturers: {
                        valueType: "set",
                        optional: true,
                      },
                      accelerator_names: { valueType: "set", optional: true },
                      accelerator_types: { valueType: "set", optional: true },
                      allowed_instance_types: {
                        valueType: "set",
                        optional: true,
                      },
                      bare_metal: { valueType: "string", optional: true },
                      burstable_performance: {
                        valueType: "string",
                        optional: true,
                      },
                      cpu_manufacturers: { valueType: "set", optional: true },
                      excluded_instance_types: {
                        valueType: "set",
                        optional: true,
                      },
                      instance_generations: {
                        valueType: "set",
                        optional: true,
                      },
                      local_storage: { valueType: "string", optional: true },
                      local_storage_types: { valueType: "set", optional: true },
                      max_spot_price_as_percentage_of_optimal_on_demand_price: {
                        valueType: "number",
                        optional: true,
                      },
                      on_demand_max_price_percentage_over_lowest_price: {
                        valueType: "number",
                        optional: true,
                      },
                      require_hibernate_support: {
                        valueType: "bool",
                        optional: true,
                      },
                      spot_max_price_percentage_over_lowest_price: {
                        valueType: "number",
                        optional: true,
                      },
                    },
                    blocks: {
                      accelerator_count: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      accelerator_total_memory_mib: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      baseline_ebs_bandwidth_mbps: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      memory_gib_per_vcpu: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      memory_mib: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      network_bandwidth_gbps: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      network_interface_count: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      total_local_storage_gb: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                      vcpu_count: {
                        nestingMode: "single",
                        maxItems: 1,
                        attributes: {
                          max: { valueType: "number", optional: true },
                          min: { valueType: "number", optional: true },
                        },
                      },
                    },
                  },
                  launch_template_specification: {
                    nestingMode: "single",
                    maxItems: 1,
                    attributes: {
                      launch_template_id: {
                        valueType: "string",
                        optional: true,
                        computed: true,
                      },
                      launch_template_name: {
                        valueType: "string",
                        optional: true,
                        computed: true,
                      },
                      version: {
                        valueType: "string",
                        optional: true,
                        computed: true,
                      },
                    },
                  },
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
          propagate_at_launch: { valueType: "bool", required: true },
          value: { valueType: "string", required: true },
        },
      },
      timeouts: {
        nestingMode: "single",
        attributes: {
          delete: { valueType: "string", optional: true },
          update: { valueType: "string", optional: true },
        },
      },
      traffic_source: {
        nestingMode: "set",
        attributes: {
          identifier: { valueType: "string", required: true },
          type: { valueType: "string", optional: true },
        },
      },
      warm_pool: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          max_group_prepared_capacity: { valueType: "number", optional: true },
          min_size: { valueType: "number", optional: true },
          pool_state: { valueType: "string", optional: true },
        },
        blocks: {
          instance_reuse_policy: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              reuse_on_scale_in: { valueType: "bool", optional: true },
            },
          },
        },
      },
    },
  },
);
