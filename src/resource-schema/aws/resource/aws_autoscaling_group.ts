import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsAutoscalingGroupResourceSchema = resource(
  "aws_autoscaling_group",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      arn: attr.string().computed(),
      availability_zones: attr.set().optional().computed(),
      capacity_rebalance: attr.bool().optional(),
      context: attr.string().optional(),
      default_cooldown: attr.number().optional().computed(),
      default_instance_warmup: attr.number().optional(),
      desired_capacity: attr.number().optional().computed(),
      desired_capacity_type: attr.string().optional(),
      enabled_metrics: attr.set().optional(),
      force_delete: attr.bool().optional(),
      force_delete_warm_pool: attr.bool().optional(),
      health_check_grace_period: attr.number().optional(),
      health_check_type: attr.string().optional().computed(),
      id: attr.string().optional().computed(),
      ignore_failed_scaling_activities: attr.bool().optional(),
      launch_configuration: attr.string().optional(),
      load_balancers: attr.set().optional().computed(),
      max_instance_lifetime: attr.number().optional(),
      max_size: attr.number().required(),
      metrics_granularity: attr.string().optional(),
      min_elb_capacity: attr.number().optional(),
      min_size: attr.number().required(),
      name: attr.string().optional().computed(),
      name_prefix: attr.string().optional().computed(),
      placement_group: attr.string().optional(),
      predicted_capacity: attr.number().computed(),
      protect_from_scale_in: attr.bool().optional(),
      region: attr.string().optional().computed(),
      service_linked_role_arn: attr.string().optional().computed(),
      suspended_processes: attr.set().optional(),
      target_group_arns: attr.set().optional().computed(),
      termination_policies: attr.list().optional(),
      vpc_zone_identifier: attr.set().optional().computed(),
      wait_for_capacity_timeout: attr.string().optional(),
      wait_for_elb_capacity: attr.number().optional(),
      warm_pool_size: attr.number().computed(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      availability_zone_distribution: block.single(
        {
          attributes: {
            capacity_distribution_strategy: attr.string().optional(),
          },
        },
        { maxItems: 1 },
      ),
      capacity_reservation_specification: block.single(
        {
          attributes: {
            capacity_reservation_preference: attr
              .string()
              .optional()
              .computed(),
          },
          blocks: {
            capacity_reservation_target: block.single(
              {
                attributes: {
                  capacity_reservation_ids: attr.list().optional(),
                  capacity_reservation_resource_group_arns: attr
                    .list()
                    .optional(),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { maxItems: 1 },
      ),
      initial_lifecycle_hook: block.set({
        attributes: {
          default_result: attr.string().optional().computed(),
          heartbeat_timeout: attr.number().optional(),
          lifecycle_transition: attr.string().required(),
          name: attr.string().required(),
          notification_metadata: attr.string().optional(),
          notification_target_arn: attr.string().optional(),
          role_arn: attr.string().optional(),
        },
      }),
      instance_maintenance_policy: block.single(
        {
          attributes: {
            max_healthy_percentage: attr.number().required(),
            min_healthy_percentage: attr.number().required(),
          },
        },
        { maxItems: 1 },
      ),
      instance_refresh: block.single(
        {
          attributes: {
            strategy: attr.string().required(),
            triggers: attr.set().optional(),
          },
          blocks: {
            preferences: block.single(
              {
                attributes: {
                  auto_rollback: attr.bool().optional(),
                  checkpoint_delay: attr.string().optional(),
                  checkpoint_percentages: attr.list().optional(),
                  instance_warmup: attr.string().optional(),
                  max_healthy_percentage: attr.number().optional(),
                  min_healthy_percentage: attr.number().optional(),
                  scale_in_protected_instances: attr.string().optional(),
                  skip_matching: attr.bool().optional(),
                  standby_instances: attr.string().optional(),
                },
                blocks: {
                  alarm_specification: block.single(
                    {
                      attributes: {
                        alarms: attr.list().optional(),
                      },
                    },
                    { maxItems: 1 },
                  ),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { maxItems: 1 },
      ),
      launch_template: block.single(
        {
          attributes: {
            id: attr.string().optional().computed(),
            name: attr.string().optional().computed(),
            version: attr.string().optional().computed(),
          },
        },
        { maxItems: 1 },
      ),
      mixed_instances_policy: block.single(
        {
          attributes: {},
          blocks: {
            instances_distribution: block.single(
              {
                attributes: {
                  on_demand_allocation_strategy: attr
                    .string()
                    .optional()
                    .computed(),
                  on_demand_base_capacity: attr.number().optional().computed(),
                  on_demand_percentage_above_base_capacity: attr
                    .number()
                    .optional()
                    .computed(),
                  spot_allocation_strategy: attr.string().optional().computed(),
                  spot_instance_pools: attr.number().optional().computed(),
                  spot_max_price: attr.string().optional(),
                },
              },
              { maxItems: 1 },
            ),
            launch_template: block.single(
              {
                attributes: {},
                blocks: {
                  launch_template_specification: block.single(
                    {
                      attributes: {
                        launch_template_id: attr.string().optional().computed(),
                        launch_template_name: attr
                          .string()
                          .optional()
                          .computed(),
                        version: attr.string().optional().computed(),
                      },
                    },
                    { minItems: 1, maxItems: 1 },
                  ),
                  override: block.list({
                    attributes: {
                      instance_type: attr.string().optional(),
                      weighted_capacity: attr.string().optional(),
                    },
                    blocks: {
                      instance_requirements: block.single(
                        {
                          attributes: {
                            accelerator_manufacturers: attr.set().optional(),
                            accelerator_names: attr.set().optional(),
                            accelerator_types: attr.set().optional(),
                            allowed_instance_types: attr.set().optional(),
                            bare_metal: attr.string().optional(),
                            burstable_performance: attr.string().optional(),
                            cpu_manufacturers: attr.set().optional(),
                            excluded_instance_types: attr.set().optional(),
                            instance_generations: attr.set().optional(),
                            local_storage: attr.string().optional(),
                            local_storage_types: attr.set().optional(),
                            max_spot_price_as_percentage_of_optimal_on_demand_price:
                              attr.number().optional(),
                            on_demand_max_price_percentage_over_lowest_price:
                              attr.number().optional(),
                            require_hibernate_support: attr.bool().optional(),
                            spot_max_price_percentage_over_lowest_price: attr
                              .number()
                              .optional(),
                          },
                          blocks: {
                            accelerator_count: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            accelerator_total_memory_mib: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            baseline_ebs_bandwidth_mbps: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            memory_gib_per_vcpu: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            memory_mib: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            network_bandwidth_gbps: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            network_interface_count: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            total_local_storage_gb: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                            vcpu_count: block.single(
                              {
                                attributes: {
                                  max: attr.number().optional(),
                                  min: attr.number().optional(),
                                },
                              },
                              { maxItems: 1 },
                            ),
                          },
                        },
                        { maxItems: 1 },
                      ),
                      launch_template_specification: block.single(
                        {
                          attributes: {
                            launch_template_id: attr
                              .string()
                              .optional()
                              .computed(),
                            launch_template_name: attr
                              .string()
                              .optional()
                              .computed(),
                            version: attr.string().optional().computed(),
                          },
                        },
                        { maxItems: 1 },
                      ),
                    },
                  }),
                },
              },
              { minItems: 1, maxItems: 1 },
            ),
          },
        },
        { maxItems: 1 },
      ),
      tag: block.set({
        attributes: {
          key: attr.string().required(),
          propagate_at_launch: attr.bool().required(),
          value: attr.string().required(),
        },
      }),
      timeouts: block.single({
        attributes: {
          delete: attr.string().optional(),
          update: attr.string().optional(),
        },
      }),
      traffic_source: block.set({
        attributes: {
          identifier: attr.string().required(),
          type: attr.string().optional(),
        },
      }),
      warm_pool: block.single(
        {
          attributes: {
            max_group_prepared_capacity: attr.number().optional(),
            min_size: attr.number().optional(),
            pool_state: attr.string().optional(),
          },
          blocks: {
            instance_reuse_policy: block.single(
              {
                attributes: {
                  reuse_on_scale_in: attr.bool().optional(),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { maxItems: 1 },
      ),
    },
  },
);
