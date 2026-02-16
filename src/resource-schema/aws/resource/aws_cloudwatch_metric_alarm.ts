import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/cloudwatch_metric_alarm
export const awsCloudwatchMetricAlarmResourceSchema = {
  kind: "resource",
  type: "aws_cloudwatch_metric_alarm",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    actions_enabled: { valueType: "bool", optional: true },
    alarm_actions: { valueType: "list", optional: true },
    alarm_description: { valueType: "string", optional: true },
    alarm_name: { valueType: "string", required: true },
    arn: { valueType: "string", computed: true },
    comparison_operator: { valueType: "string", required: true },
    datapoints_to_alarm: { valueType: "number", optional: true },
    dimensions: { valueType: "map", optional: true },
    evaluate_low_sample_count_percentiles: {
      valueType: "string",
      optional: true,
    },
    evaluation_periods: { valueType: "number", required: true },
    extended_statistic: { valueType: "string", optional: true },
    insufficient_data_actions: { valueType: "list", optional: true },
    metric_name: { valueType: "string", optional: true },
    namespace: { valueType: "string", optional: true },
    ok_actions: { valueType: "list", optional: true },
    period: { valueType: "number", optional: true },
    statistic: { valueType: "string", optional: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    threshold: { valueType: "number", optional: true },
    threshold_metric_id: { valueType: "string", optional: true },
    treat_missing_data: { valueType: "string", optional: true },
    unit: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    metric_query: {
      nestingMode: "list",
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
          nestingMode: "list",
          maxItems: 1,
          attributes: {
            metric_name: { valueType: "string", required: true },
            namespace: { valueType: "string", required: true },
            period: { valueType: "number", required: true },
            stat: { valueType: "string", required: true },
            unit: { valueType: "string", optional: true },
          },
          blocks: {
            dimensions: {
              nestingMode: "single",
              attributes: {
                name: { valueType: "string", required: true },
                value: { valueType: "string", required: true },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies TerraformTypeSchema;
