import { Resource } from "react-hcl";

export default (
  <>
    <Resource type="aws_vpc" label="main" cidr_block="10.0.0.0/16" />
    <Resource
      type="aws_subnet"
      label="public"
      cidr_block="10.0.1.0/24"
      map_public_ip_on_launch={true}
    />
  </>
);
