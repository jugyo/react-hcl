import { createAwsResource, type GenericAwsResourceProps } from "./shared";

type SecurityGroupRule = {
  from_port?: number;
  to_port?: number;
  protocol?: string;
  cidr_blocks?: string[];
  ipv6_cidr_blocks?: string[];
  prefix_list_ids?: string[];
  security_groups?: string[];
  self?: boolean;
  description?: string;
};

export type AwsVpcProps = GenericAwsResourceProps & {
  cidr_block: string;
  enable_dns_support?: boolean;
  enable_dns_hostnames?: boolean;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc
 * Verified: 2026-02-15
 */
export function AwsVpc(props: AwsVpcProps) {
  return createAwsResource("aws_vpc", props);
}

export type AwsSubnetProps = GenericAwsResourceProps & {
  vpc_id: string;
  cidr_block: string;
  availability_zone?: string;
  map_public_ip_on_launch?: boolean;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/subnet
 * Verified: 2026-02-15
 */
export function AwsSubnet(props: AwsSubnetProps) {
  return createAwsResource("aws_subnet", props);
}

export type AwsSecurityGroupProps = GenericAwsResourceProps & {
  description?: string;
  vpc_id?: string;
  ingress?: SecurityGroupRule | SecurityGroupRule[];
  egress?: SecurityGroupRule | SecurityGroupRule[];
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/security_group
 * Verified: 2026-02-15
 */
export function AwsSecurityGroup(props: AwsSecurityGroupProps) {
  return createAwsResource("aws_security_group", props);
}

export type AwsRouteTableProps = GenericAwsResourceProps & {
  vpc_id: string;
  route?: Record<string, unknown> | Array<Record<string, unknown>>;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table
 * Verified: 2026-02-15
 */
export function AwsRouteTable(props: AwsRouteTableProps) {
  return createAwsResource("aws_route_table", props);
}

export type AwsRouteProps = GenericAwsResourceProps & {
  route_table_id: string;
  destination_cidr_block?: string;
  destination_ipv6_cidr_block?: string;
  destination_prefix_list_id?: string;
  gateway_id?: string;
  nat_gateway_id?: string;
  transit_gateway_id?: string;
  vpc_endpoint_id?: string;
  network_interface_id?: string;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route
 * Verified: 2026-02-15
 */
export function AwsRoute(props: AwsRouteProps) {
  return createAwsResource("aws_route", props);
}

export type AwsInternetGatewayProps = GenericAwsResourceProps & {
  vpc_id?: string;
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/internet_gateway
 * Verified: 2026-02-15
 */
export function AwsInternetGateway(props: AwsInternetGatewayProps) {
  return createAwsResource("aws_internet_gateway", props);
}

export type AwsNatGatewayProps = GenericAwsResourceProps & {
  allocation_id: string;
  subnet_id: string;
  connectivity_type?: "private" | "public";
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/nat_gateway
 * Verified: 2026-02-15
 */
export function AwsNatGateway(props: AwsNatGatewayProps) {
  return createAwsResource("aws_nat_gateway", props);
}

export type AwsEipProps = GenericAwsResourceProps & {
  domain?: "vpc";
  tags?: Record<string, string>;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/eip
 * Verified: 2026-02-15
 */
export function AwsEip(props: AwsEipProps) {
  return createAwsResource("aws_eip", props);
}

type AwsRouteTableAssociationBaseProps = GenericAwsResourceProps & {
  route_table_id: string;
};

export type AwsRouteTableAssociationProps =
  | (AwsRouteTableAssociationBaseProps & { subnet_id: string; gateway_id?: never })
  | (AwsRouteTableAssociationBaseProps & { gateway_id: string; subnet_id?: never });

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/route_table_association
 * Verified: 2026-02-15
 */
export function AwsRouteTableAssociation(props: AwsRouteTableAssociationProps) {
  return createAwsResource("aws_route_table_association", props);
}

export type AwsVpcSecurityGroupIngressRuleProps = GenericAwsResourceProps & {
  security_group_id: string;
  ip_protocol: string;
  from_port?: number;
  to_port?: number;
  cidr_ipv4?: string;
  cidr_ipv6?: string;
  prefix_list_id?: string;
  referenced_security_group_id?: string;
  description?: string;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_security_group_ingress_rule
 * Verified: 2026-02-15
 */
export function AwsVpcSecurityGroupIngressRule(props: AwsVpcSecurityGroupIngressRuleProps) {
  return createAwsResource("aws_vpc_security_group_ingress_rule", props);
}

export type AwsVpcSecurityGroupEgressRuleProps = GenericAwsResourceProps & {
  security_group_id: string;
  ip_protocol: string;
  from_port?: number;
  to_port?: number;
  cidr_ipv4?: string;
  cidr_ipv6?: string;
  prefix_list_id?: string;
  referenced_security_group_id?: string;
  description?: string;
};

/**
 * Docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/vpc_security_group_egress_rule
 * Verified: 2026-02-15
 */
export function AwsVpcSecurityGroupEgressRule(props: AwsVpcSecurityGroupEgressRuleProps) {
  return createAwsResource("aws_vpc_security_group_egress_rule", props);
}
