import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudwatchMetricAlarmResourceSchema = resource(
  "aws_cloudwatch_metric_alarm",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      actions_enabled: attr.bool({ optional: true }),
      alarm_actions: attr.set({ optional: true }),
      alarm_description: attr.string({ optional: true }),
      alarm_name: attr.string({ required: true }),
      arn: attr.string({ computed: true }),
      comparison_operator: attr.string({ required: true }),
      datapoints_to_alarm: attr.number({ optional: true }),
      dimensions: attr.map({ optional: true }),
      evaluate_low_sample_count_percentiles: attr.string({
        optional: true,
        computed: true,
      }),
      evaluation_periods: attr.number({ required: true }),
      extended_statistic: attr.string({ optional: true }),
      id: attr.string({ optional: true, computed: true }),
      insufficient_data_actions: attr.set({ optional: true }),
      metric_name: attr.string({ optional: true }),
      namespace: attr.string({ optional: true }),
      ok_actions: attr.set({ optional: true }),
      period: attr.number({ optional: true }),
      region: attr.string({ optional: true, computed: true }),
      statistic: attr.string({ optional: true }),
      tags: attr.map({ optional: true }),
      tags_all: attr.map({ optional: true, computed: true }),
      threshold: attr.number({ optional: true }),
      threshold_metric_id: attr.string({ optional: true }),
      treat_missing_data: attr.string({ optional: true }),
      unit: attr.string({ optional: true }),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      metric_query: block.set({
        attributes: {
          account_id: attr.string({ optional: true }),
          expression: attr.string({ optional: true }),
          id: attr.string({ required: true }),
          label: attr.string({ optional: true }),
          period: attr.number({ optional: true }),
          return_data: attr.bool({ optional: true }),
        },
        blocks: {
          metric: block.single(
            {
              attributes: {
                dimensions: attr.map({ optional: true }),
                metric_name: attr.string({ required: true }),
                namespace: attr.string({ optional: true }),
                period: attr.number({ required: true }),
                stat: attr.string({ required: true }),
                unit: attr.string({ optional: true }),
              },
            },
            { maxItems: 1 },
          ),
        },
      }),
    },
  },
);
