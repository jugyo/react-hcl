import { Resource } from "react-hcl";

export default (
  <Resource type="aws_instance" label="example">
    {`
      ami           = "\${var.ami_id}"
      instance_type = "\${var.instance_type}"
      tags = {
        Name = "\${var.project}-\${var.environment}"
      }
    `}
  </Resource>
);
