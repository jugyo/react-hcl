import { Module } from "react-hcl";

export default (
  <Module label="vpc">
    {`
      source  = "terraform-aws-modules/vpc/aws"
      version = "~> 5.0"

      name = "my-vpc"
      cidr = "10.0.0.0/16"

      azs             = ["us-east-1a", "us-east-1b"]
      private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
    `}
  </Module>
);
