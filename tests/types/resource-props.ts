import { Resource } from "../../src/components/resource";
import { tf } from "../../src/helpers/tf";

Resource({
  type: "aws_instance",
  label: "web",
  ami: "ami-123",
  instance_type: "t3.micro",
  subnet_id: tf.raw("aws_subnet.public.id"),
  root_block_device: { volume_size: 20 },
  ebs_block_device: [{ device_name: "/dev/sdf", volume_size: 100 }],
});

// @ts-expect-error missing required property: label
Resource({
  type: "aws_instance",
  ami: "ami-123",
  instance_type: "t3.micro",
});

// @ts-expect-error unknown property for known aws resource type
Resource({
  type: "aws_instance",
  label: "web",
  ami: "ami-123",
  instance_type: "t3.micro",
  foo: "bar",
});

// @ts-expect-error computed attribute should not be accepted
Resource({
  type: "aws_instance",
  label: "web",
  ami: "ami-123",
  instance_type: "t3.micro",
  arn: "not-allowed",
});

Resource({
  type: "aws_route53_record",
  label: "example",
  any_key: "allowed-for-unsupported-types",
});
