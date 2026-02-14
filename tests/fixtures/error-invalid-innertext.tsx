import { Resource } from "react-hcl";

export default (
  <Resource type="aws_instance" name="bad">
    {`
      ami = "ami-xxx"
      this is not valid HCL {{{
    `}
  </Resource>
);
