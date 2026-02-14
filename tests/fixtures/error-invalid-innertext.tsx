import { Resource } from "react-terraform";

export default (
  <Resource type="aws_instance" name="bad">
    {`
      ami = "ami-xxx"
      this is not valid HCL {{{
    `}
  </Resource>
);
