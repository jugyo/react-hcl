import { Module, Resource, useRef, Fragment } from "react-terraform";

export default function App() {
  const vpc = useRef();

  return (
    <>
      <Module
        ref={vpc}
        name="vpc"
        source="terraform-aws-modules/vpc/aws"
        version="~> 5.0"
        cidr="10.0.0.0/16"
      />

      <Resource
        type="aws_instance"
        name="app"
        ami="ami-0c55b159cbfafe1f0"
        instance_type="t3.micro"
        subnet_id={vpc.private_subnets}
        vpc_security_group_ids={vpc.default_security_group_id}
      />
    </>
  );
}
