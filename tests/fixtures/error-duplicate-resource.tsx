import { Resource } from "react-terraform";

export default (
  <>
    <Resource type="aws_vpc" name="main" cidr_block="10.0.0.0/16" />
    <Resource type="aws_vpc" name="main" cidr_block="10.1.0.0/16" />
  </>
);
