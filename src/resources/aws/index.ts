export {
  AwsIamPolicy,
  type AwsIamPolicyProps,
  AwsIamRole,
  AwsIamRolePolicyAttachment,
  type AwsIamRolePolicyAttachmentProps,
  type AwsIamRoleProps,
} from "./iam";
export {
  AwsEip,
  type AwsEipProps,
  AwsInternetGateway,
  type AwsInternetGatewayProps,
  AwsNatGateway,
  type AwsNatGatewayProps,
  AwsRoute,
  type AwsRouteProps,
  AwsRouteTable,
  AwsRouteTableAssociation,
  type AwsRouteTableAssociationProps,
  type AwsRouteTableProps,
  AwsSecurityGroup,
  type AwsSecurityGroupProps,
  AwsSubnet,
  type AwsSubnetProps,
  AwsVpc,
  type AwsVpcProps,
  AwsVpcSecurityGroupEgressRule,
  type AwsVpcSecurityGroupEgressRuleProps,
  AwsVpcSecurityGroupIngressRule,
  type AwsVpcSecurityGroupIngressRuleProps,
} from "./network";

export {
  AwsS3Bucket,
  AwsS3BucketPolicy,
  type AwsS3BucketPolicyProps,
  type AwsS3BucketProps,
  AwsS3BucketPublicAccessBlock,
  type AwsS3BucketPublicAccessBlockProps,
} from "./s3";

import { AwsIamPolicy, AwsIamRole, AwsIamRolePolicyAttachment } from "./iam";
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
import {
  AwsS3Bucket,
  AwsS3BucketPolicy,
  AwsS3BucketPublicAccessBlock,
} from "./s3";

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
