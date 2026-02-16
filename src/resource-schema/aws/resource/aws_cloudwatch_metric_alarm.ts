import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudwatchMetricAlarmResourceSchema = resource(
  "aws_cloudwatch_metric_alarm",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      actions_enabled: attr.bool().optional(),
      alarm_actions: attr.set().optional(),
      alarm_description: attr.string().optional(),
      alarm_name: attr.string().required(),
      arn: attr.string().computed(),
      comparison_operator: attr.string().required(),
      datapoints_to_alarm: attr.number().optional(),
      dimensions: attr.map().optional(),
      evaluate_low_sample_count_percentiles: attr
        .string()
        .optional()
        .computed(),
      evaluation_periods: attr.number().required(),
      extended_statistic: attr.string().optional(),
      id: attr.string().optional().computed(),
      insufficient_data_actions: attr.set().optional(),
      metric_name: attr.string().optional(),
      namespace: attr.string().optional(),
      ok_actions: attr.set().optional(),
      period: attr.number().optional(),
      region: attr.string().optional().computed(),
      statistic: attr.string().optional(),
      tags: attr.map().optional(),
      tags_all: attr.map().optional().computed(),
      threshold: attr.number().optional(),
      threshold_metric_id: attr.string().optional(),
      treat_missing_data: attr.string().optional(),
      unit: attr.string().optional(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      metric_query: block.set({
        attributes: {
          account_id: attr.string().optional(),
          expression: attr.string().optional(),
          id: attr.string().required(),
          label: attr.string().optional(),
          period: attr.number().optional(),
          return_data: attr.bool().optional(),
        },
        blocks: {
          metric: block.single(
            {
              attributes: {
                dimensions: attr.map().optional(),
                metric_name: attr.string().required(),
                namespace: attr.string().optional(),
                period: attr.number().required(),
                stat: attr.string().required(),
                unit: attr.string().optional(),
              },
            },
            { maxItems: 1 },
          ),
        },
      }),
    },
  },
);
