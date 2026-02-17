import { Output, Resource, Terraform, tf } from "react-hcl";

export default function Main() {
  return (
    [
      <Output
        label="instance_id"
        value={tf.raw("aws_instance.web.id")}
      />,
      <Resource
        type="aws_instance"
        label="web"
        ami={tf.raw("data.aws_ami.al2.id")}
        instance_type="t3.micro"
        root_block_device={tf.block({ volume_size: 20 })}
        tags={{ Env: tf.raw("var.env"), Name: "web" }}
      />,
      <Terraform
        required_version=">= 1.5.0"
      />,
    ]
  );
}
