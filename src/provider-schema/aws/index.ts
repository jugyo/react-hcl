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
import { awsS3BucketResourceSchema } from "./resource/aws_s3_bucket";
import { awsS3BucketLifecycleConfigurationResourceSchema } from "./resource/aws_s3_bucket_lifecycle_configuration";
import { awsS3BucketServerSideEncryptionConfigurationResourceSchema } from "./resource/aws_s3_bucket_server_side_encryption_configuration";
import { awsS3BucketVersioningResourceSchema } from "./resource/aws_s3_bucket_versioning";
import { awsSecurityGroupResourceSchema } from "./resource/aws_security_group";
import { awsSubnetResourceSchema } from "./resource/aws_subnet";
import { awsVpcResourceSchema } from "./resource/aws_vpc";
import { awsVpcSecurityGroupEgressRuleResourceSchema } from "./resource/aws_vpc_security_group_egress_rule";
import { awsVpcSecurityGroupIngressRuleResourceSchema } from "./resource/aws_vpc_security_group_ingress_rule";

export const AWS_RESOURCE_SCHEMAS = {
  aws_instance: awsInstanceResourceSchema,
  aws_security_group: awsSecurityGroupResourceSchema,
  aws_vpc: awsVpcResourceSchema,
  aws_subnet: awsSubnetResourceSchema,
  aws_autoscaling_group: awsAutoscalingGroupResourceSchema,
  aws_cloudfront_distribution: awsCloudfrontDistributionResourceSchema,
  aws_cloudwatch_metric_alarm: awsCloudwatchMetricAlarmResourceSchema,
  aws_s3_bucket: awsS3BucketResourceSchema,
  aws_s3_bucket_server_side_encryption_configuration:
    awsS3BucketServerSideEncryptionConfigurationResourceSchema,
  aws_s3_bucket_versioning: awsS3BucketVersioningResourceSchema,
  aws_s3_bucket_lifecycle_configuration:
    awsS3BucketLifecycleConfigurationResourceSchema,
  aws_db_instance: awsDbInstanceResourceSchema,
  aws_db_subnet_group: awsDbSubnetGroupResourceSchema,
  aws_vpc_security_group_ingress_rule:
    awsVpcSecurityGroupIngressRuleResourceSchema,
  aws_vpc_security_group_egress_rule:
    awsVpcSecurityGroupEgressRuleResourceSchema,
} as const satisfies Record<string, TerraformTypeSchema>;

export const AWS_DATA_SCHEMAS = {
  aws_ami: awsAmiDataSchema,
  aws_availability_zones: awsAvailabilityZonesDataSchema,
  aws_subnets: awsSubnetsDataSchema,
  aws_vpc: awsVpcDataSchema,
} as const satisfies Record<string, TerraformTypeSchema>;
