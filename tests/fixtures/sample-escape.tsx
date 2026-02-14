import { Resource } from "react-terraform";

export default (
  <Resource type="aws_instance" name="example">
    {`
      ami           = "\${var.ami_id}"
      instance_type = "\${var.instance_type}"
      tags = {
        Name = "\${var.project}-\${var.environment}"
      }
    `}
  </Resource>
);
