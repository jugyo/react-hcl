import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudwatchMetricAlarmResourceSchema = resource(
  "aws_cloudwatch_metric_alarm",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      actions_enabled: { valueType: "bool", optional: true },
      alarm_actions: { valueType: "set", optional: true },
      alarm_description: { valueType: "string", optional: true },
      alarm_name: { valueType: "string", required: true },
      arn: { valueType: "string", computed: true },
      comparison_operator: { valueType: "string", required: true },
      datapoints_to_alarm: { valueType: "number", optional: true },
      dimensions: { valueType: "map", optional: true },
      evaluate_low_sample_count_percentiles: {
        valueType: "string",
        optional: true,
        computed: true,
      },
      evaluation_periods: { valueType: "number", required: true },
      extended_statistic: { valueType: "string", optional: true },
      id: { valueType: "string", optional: true, computed: true },
      insufficient_data_actions: { valueType: "set", optional: true },
      metric_name: { valueType: "string", optional: true },
      namespace: { valueType: "string", optional: true },
      ok_actions: { valueType: "set", optional: true },
      period: { valueType: "number", optional: true },
      region: { valueType: "string", optional: true, computed: true },
      statistic: { valueType: "string", optional: true },
      tags: { valueType: "map", optional: true },
      tags_all: { valueType: "map", optional: true, computed: true },
      threshold: { valueType: "number", optional: true },
      threshold_metric_id: { valueType: "string", optional: true },
      treat_missing_data: { valueType: "string", optional: true },
      unit: { valueType: "string", optional: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      metric_query: {
        nestingMode: "set",
        attributes: {
          account_id: { valueType: "string", optional: true },
          expression: { valueType: "string", optional: true },
          id: { valueType: "string", required: true },
          label: { valueType: "string", optional: true },
          period: { valueType: "number", optional: true },
          return_data: { valueType: "bool", optional: true },
        },
        blocks: {
          metric: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              dimensions: { valueType: "map", optional: true },
              metric_name: { valueType: "string", required: true },
              namespace: { valueType: "string", optional: true },
              period: { valueType: "number", required: true },
              stat: { valueType: "string", required: true },
              unit: { valueType: "string", optional: true },
            },
          },
        },
      },
    },
  },
);
