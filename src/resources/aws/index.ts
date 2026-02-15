export {
  AwsEip,
  AwsInternetGateway,
  AwsNatGateway,
  AwsRoute,
  AwsRouteTable,
  AwsRouteTableAssociation,
  AwsSecurityGroup,
  AwsSubnet,
  AwsVpc,
  AwsVpcSecurityGroupEgressRule,
  AwsVpcSecurityGroupIngressRule,
  type AwsEipProps,
  type AwsInternetGatewayProps,
  type AwsNatGatewayProps,
  type AwsRouteProps,
  type AwsRouteTableAssociationProps,
  type AwsRouteTableProps,
  type AwsSecurityGroupProps,
  type AwsSubnetProps,
  type AwsVpcProps,
  type AwsVpcSecurityGroupEgressRuleProps,
  type AwsVpcSecurityGroupIngressRuleProps,
} from "./network";

export {
  AwsIamPolicy,
  AwsIamRole,
  AwsIamRolePolicyAttachment,
  type AwsIamPolicyProps,
  type AwsIamRolePolicyAttachmentProps,
  type AwsIamRoleProps,
} from "./iam";

export {
  AwsS3Bucket,
  AwsS3BucketPolicy,
  AwsS3BucketPublicAccessBlock,
  type AwsS3BucketPolicyProps,
  type AwsS3BucketProps,
  type AwsS3BucketPublicAccessBlockProps,
} from "./s3";

import {
  AwsEip,
  AwsInternetGateway,
  AwsNatGateway,
  AwsRoute,
  AwsRouteTable,
  AwsRouteTableAssociation,
  AwsSecurityGroup,
  AwsSubnet,
  AwsVpc,
  AwsVpcSecurityGroupEgressRule,
  AwsVpcSecurityGroupIngressRule,
} from "./network";
import { AwsIamPolicy, AwsIamRole, AwsIamRolePolicyAttachment } from "./iam";
import { AwsS3Bucket, AwsS3BucketPolicy, AwsS3BucketPublicAccessBlock } from "./s3";

export const Aws = {
  Vpc: AwsVpc,
  Subnet: AwsSubnet,
  SecurityGroup: AwsSecurityGroup,
  RouteTable: AwsRouteTable,
  Route: AwsRoute,
  InternetGateway: AwsInternetGateway,
  NatGateway: AwsNatGateway,
  Eip: AwsEip,
  RouteTableAssociation: AwsRouteTableAssociation,
  IamRole: AwsIamRole,
  IamPolicy: AwsIamPolicy,
  IamRolePolicyAttachment: AwsIamRolePolicyAttachment,
  S3Bucket: AwsS3Bucket,
  S3BucketPolicy: AwsS3BucketPolicy,
  S3BucketPublicAccessBlock: AwsS3BucketPublicAccessBlock,
  VpcSecurityGroupIngressRule: AwsVpcSecurityGroupIngressRule,
  VpcSecurityGroupEgressRule: AwsVpcSecurityGroupEgressRule,
};
