import { Module, Provider, useRef } from "react-hcl";

export default function App() {
  const east = useRef();
  const west = useRef();

  return (
    <>
      <Provider type="aws" ref={east} alias="east" region="us-east-1" />
      <Provider type="aws" ref={west} alias="west" region="us-west-2" />

      <Module
        name="vpc_east"
        source="terraform-aws-modules/vpc/aws"
        providers={{ aws: east }}
        cidr="10.0.0.0/16"
      />

      <Module
        name="vpc_west"
        source="terraform-aws-modules/vpc/aws"
        providers={{ aws: west }}
        cidr="10.1.0.0/16"
      />
    </>
  );
}
