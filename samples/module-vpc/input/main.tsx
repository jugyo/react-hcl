/**
 * VPC Module with EC2 Instance
 *
 * Uses the terraform-aws-modules/vpc/aws registry module
 * and references its outputs via useRef to place an EC2 instance.
 */
import { Module, Output, Provider, Resource, raw, useRef } from "react-hcl";

function Main() {
  const vpc = useRef();

  return (
    <>
      <Provider type="aws" region="ap-northeast-1" />

      <Module
        ref={vpc}
        name="vpc"
        source="terraform-aws-modules/vpc/aws"
        version="~> 5.0"
        attributes={{ name: "demo-vpc" }}
        cidr="10.0.0.0/16"
        azs={["ap-northeast-1a", "ap-northeast-1c"]}
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
        subnet_id={raw(`${vpc.private_subnets}[0]`)}
        tags={{ Name: "app-server" }}
      />

      <Output name="vpc_id" value={vpc.vpc_id} />
      <Output name="private_subnets" value={vpc.private_subnets} />
    </>
  );
}

export default <Main />;
