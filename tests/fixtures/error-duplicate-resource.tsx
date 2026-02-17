import { Resource } from "react-hcl";

export default (
  <>
    <Resource type="aws_vpc" label="main" cidr_block="10.0.0.0/16" />
    <Resource type="aws_vpc" label="main" cidr_block="10.1.0.0/16" />
  </>
);
