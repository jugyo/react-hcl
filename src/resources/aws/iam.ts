import { createAwsResource, type GenericAwsResourceProps } from "./shared";

export type AwsIamRoleProps = GenericAwsResourceProps & {
  assume_role_policy: string;
  description?: string;
  managed_policy_arns?: string[];
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
 * Verified: 2026-02-15
 */
export function AwsIamRole(props: AwsIamRoleProps) {
  return createAwsResource("aws_iam_role", props);
}

export type AwsIamPolicyProps = GenericAwsResourceProps & {
  policy: string;
  description?: string;
  path?: string;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
 * Verified: 2026-02-15
 */
export function AwsIamPolicy(props: AwsIamPolicyProps) {
  return createAwsResource("aws_iam_policy", props);
}

export type AwsIamRolePolicyAttachmentProps = GenericAwsResourceProps & {
  role: string;
  policy_arn: string;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
 * Verified: 2026-02-15
 */
export function AwsIamRolePolicyAttachment(props: AwsIamRolePolicyAttachmentProps) {
  return createAwsResource("aws_iam_role_policy_attachment", props);
}
