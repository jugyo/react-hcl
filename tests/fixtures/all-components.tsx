import {
  Data,
  Locals,
  Output,
  Provider,
  Resource,
  Terraform,
  Variable,
} from "react-hcl";

export default (
  <>
    <Terraform required_version=">= 1.0" />
    <Provider type="aws" region="ap-northeast-1" />
    <Variable name="environment" type="string" default="dev" />
    <Locals environment="prod" />
    <Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />
    <Data type="aws_ami" name="latest" most_recent={true} />
    <Output name="vpc_id" value="aws_vpc.main.id" />
  </>
);
