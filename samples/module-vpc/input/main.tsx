/**
 * VPC Module with EC2 Instance
 *
 * Uses the terraform-aws-modules/vpc/aws registry module
 * and references its outputs via useRef to place an EC2 instance.
 */
import {
  Data,
  Module,
  Output,
  Provider,
  Resource,
  Terraform,
  tf,
  useRef,
} from "react-hcl";

function Main() {
  const vpc = useRef();
  const azRef = useRef();

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
      <Provider type="aws" region="ap-northeast-1" />
      <Data type="aws_availability_zones" name="available" ref={azRef} />

      <Module
        ref={vpc}
        name="vpc"
        source="terraform-aws-modules/vpc/aws"
        version="~> 5.0"
        attributes={{ name: "demo-vpc" }}
        cidr="10.0.0.0/16"
        azs={azRef.names}
        public_subnets={["10.0.1.0/24", "10.0.2.0/24"]}
        private_subnets={["10.0.101.0/24", "10.0.102.0/24"]}
        enable_nat_gateway={true}
        single_nat_gateway={true}
        tags={{ Environment: "dev", Project: "demo" }}
      />

      <Resource
        type="aws_instance"
        name="app"
        ami="ami-0c55b159cbfafe1f0"
        instance_type="t3.micro"
        subnet_id={tf.raw(`${vpc.private_subnets}[0]`)}
        tags={{ Name: "app-server" }}
      />

      <Output name="vpc_id" value={vpc.vpc_id} />
      <Output name="private_subnets" value={vpc.private_subnets} />
    </>
  );
}

export default <Main />;
