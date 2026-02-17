/**
 * VPC Network with Public/Private Subnets
 *
 * VPC + Public Subnets + Private Subnets + IGW + NAT Gateway + Route Tables.
 * Based on: https://github.com/hashicorp/microservices-architecture-on-aws
 */
import {
  Data,
  Output,
  Provider,
  Resource,
  Terraform,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function Main({ region }: { region: string }) {
  const azRef = useRef();
  const vpcRef = useRef();
  const igwRef = useRef();
  const publicRtRef = useRef();
  const privateRtRef = useRef();
  const eipRef = useRef();
  const natRef = useRef();

  return (
    <>
      <Terraform
        required_version=">= 1.2.8"
        required_providers={{
          aws: {
            source: "hashicorp/aws",
            version: "~> 6.0",
          },
        }}
      />
      <Provider type="aws" region={region} />

      <Variable
        name="vpc_cidr"
        type="string"
        default="10.0.0.0/16"
        description="VPC CIDR block"
      />
      <Variable
        name="public_subnet_count"
        type="number"
        default={2}
        description="Number of public subnets"
      />
      <Variable
        name="private_subnet_count"
        type="number"
        default={2}
        description="Number of private subnets"
      />
      <Variable
        name="project_name"
        type="string"
        default="demo"
        description="Project name for resource tags"
      />

      <Data type="aws_availability_zones" name="available" ref={azRef} />

      <Resource
        type="aws_vpc"
        label="main"
        ref={vpcRef}
        cidr_block={tf.var("vpc_cidr")}
        enable_dns_hostnames={true}
        enable_dns_support={true}
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation
        tags={{ Name: "${var.project_name}-vpc" }}
      />

      {/* Public subnets across multiple AZs */}
      <Resource type="aws_subnet" label="public">
        {`
          count                   = ${tf.var("public_subnet_count")}
          vpc_id                  = ${vpcRef.id}
          cidr_block              = cidrsubnet(${tf.var("vpc_cidr")}, 8, count.index)
          availability_zone       = ${azRef.names}[count.index]
          map_public_ip_on_launch = true

          tags = {
            Name = "\${${tf.var("project_name")}}-public-\${count.index}"
          }
        `}
      </Resource>

      {/* Private subnets across multiple AZs */}
      <Resource type="aws_subnet" label="private">
        {`
          count             = ${tf.var("private_subnet_count")}
          vpc_id            = ${vpcRef.id}
          cidr_block        = cidrsubnet(${tf.var("vpc_cidr")}, 8, count.index + 100)
          availability_zone = ${azRef.names}[count.index]

          tags = {
            Name = "\${${tf.var("project_name")}}-private-\${count.index}"
          }
        `}
      </Resource>

      {/* Internet Gateway */}
      <Resource
        type="aws_internet_gateway"
        label="main"
        ref={igwRef}
        vpc_id={vpcRef.id}
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation
        tags={{ Name: "${var.project_name}-igw" }}
      />

      {/* Public route table */}
      <Resource
        type="aws_route_table"
        label="public"
        ref={publicRtRef}
        vpc_id={vpcRef.id}
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation
        tags={{ Name: "${var.project_name}-public-rt" }}
      />

      <Resource
        type="aws_route"
        label="public_internet_access"
        route_table_id={publicRtRef.id}
        destination_cidr_block="0.0.0.0/0"
        gateway_id={igwRef.id}
      />

      <Resource type="aws_route_table_association" label="public">
        {`
          count          = ${tf.var("public_subnet_count")}
          subnet_id      = element(aws_subnet.public[*].id, count.index)
          route_table_id = ${publicRtRef.id}
        `}
      </Resource>

      {/* NAT Gateway with Elastic IP */}
      <Resource
        type="aws_eip"
        label="nat"
        ref={eipRef}
        domain="vpc"
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation
        tags={{ Name: "${var.project_name}-nat-eip" }}
      />

      <Resource type="aws_nat_gateway" label="main" ref={natRef}>
        {`
          allocation_id = ${eipRef.id}
          subnet_id     = aws_subnet.public[0].id

          tags = {
            Name = "\${${tf.var("project_name")}}-nat"
          }

          depends_on = [${eipRef.__dependsOnValue}, ${igwRef.__dependsOnValue}]
        `}
      </Resource>

      {/* Private route table */}
      <Resource
        type="aws_route_table"
        label="private"
        ref={privateRtRef}
        vpc_id={vpcRef.id}
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Terraform interpolation
        tags={{ Name: "${var.project_name}-private-rt" }}
      />

      <Resource
        type="aws_route"
        label="private_internet_access"
        route_table_id={privateRtRef.id}
        destination_cidr_block="0.0.0.0/0"
        nat_gateway_id={natRef.id}
      />

      <Resource type="aws_route_table_association" label="private">
        {`
          count          = ${tf.var("private_subnet_count")}
          subnet_id      = element(aws_subnet.private[*].id, count.index)
          route_table_id = ${privateRtRef.id}
        `}
      </Resource>

      {/* Outputs */}
      <Output name="vpc_id" value={vpcRef.id} />
      <Output
        name="public_subnet_ids"
        value={tf.raw("aws_subnet.public[*].id")}
      />
      <Output
        name="private_subnet_ids"
        value={tf.raw("aws_subnet.private[*].id")}
      />
    </>
  );
}

export default <Main region="ap-northeast-1" />;
