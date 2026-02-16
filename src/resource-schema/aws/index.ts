import type { TerraformTypeSchema } from "../types";
import { awsAmiDataSchema } from "./data/aws_ami";
import { awsAvailabilityZonesDataSchema } from "./data/aws_availability_zones";
import { awsSubnetsDataSchema } from "./data/aws_subnets";
import { awsVpcDataSchema } from "./data/aws_vpc";
import { awsAutoscalingGroupResourceSchema } from "./resource/aws_autoscaling_group";
import { awsCloudfrontDistributionResourceSchema } from "./resource/aws_cloudfront_distribution";
import { awsCloudwatchMetricAlarmResourceSchema } from "./resource/aws_cloudwatch_metric_alarm";
import { awsDbInstanceResourceSchema } from "./resource/aws_db_instance";
import { awsDbSubnetGroupResourceSchema } from "./resource/aws_db_subnet_group";
import { awsInstanceResourceSchema } from "./resource/aws_instance";
import { awsS3BucketLifecycleConfigurationResourceSchema } from "./resource/aws_s3_bucket_lifecycle_configuration";
import { awsS3BucketServerSideEncryptionConfigurationResourceSchema } from "./resource/aws_s3_bucket_server_side_encryption_configuration";
import { awsS3BucketVersioningResourceSchema } from "./resource/aws_s3_bucket_versioning";
import { awsSecurityGroupResourceSchema } from "./resource/aws_security_group";
import { awsSubnetResourceSchema } from "./resource/aws_subnet";
import { awsVpcResourceSchema } from "./resource/aws_vpc";
import { awsVpcSecurityGroupEgressRuleResourceSchema } from "./resource/aws_vpc_security_group_egress_rule";
import { awsVpcSecurityGroupIngressRuleResourceSchema } from "./resource/aws_vpc_security_group_ingress_rule";

function indexByType(
  schemas: TerraformTypeSchema[],
): Record<string, TerraformTypeSchema> {
  return Object.fromEntries(schemas.map((schema) => [schema.type, schema]));
}

export const AWS_RESOURCE_SCHEMAS: Record<string, TerraformTypeSchema> =
  indexByType([
    awsInstanceResourceSchema,
    awsSecurityGroupResourceSchema,
    awsVpcResourceSchema,
    awsSubnetResourceSchema,
    awsAutoscalingGroupResourceSchema,
    awsCloudfrontDistributionResourceSchema,
    awsCloudwatchMetricAlarmResourceSchema,
    awsS3BucketServerSideEncryptionConfigurationResourceSchema,
    awsS3BucketVersioningResourceSchema,
    awsS3BucketLifecycleConfigurationResourceSchema,
    awsDbInstanceResourceSchema,
    awsDbSubnetGroupResourceSchema,
    awsVpcSecurityGroupIngressRuleResourceSchema,
    awsVpcSecurityGroupEgressRuleResourceSchema,
  ]);

export const AWS_DATA_SCHEMAS: Record<string, TerraformTypeSchema> =
  indexByType([
    awsAmiDataSchema,
    awsAvailabilityZonesDataSchema,
    awsSubnetsDataSchema,
    awsVpcDataSchema,
  ]);
