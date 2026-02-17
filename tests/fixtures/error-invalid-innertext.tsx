import { Resource } from "react-hcl";

export default (
  <Resource type="aws_instance" label="bad">
    {`
      ami = "ami-xxx"
      this is not valid HCL {{{
    `}
  </Resource>
);
