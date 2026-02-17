import { Resource, useRef } from "react-hcl";

export default function App() {
  const vpcRef = useRef();
  return (
    <>
      <Resource
        type="aws_vpc"
        label="main"
        ref={vpcRef}
        cidr_block="10.0.0.0/16"
      />
      <Resource
        type="aws_subnet"
        label="public"
        vpc_id={vpcRef.id}
        cidr_block="10.0.1.0/24"
      />
    </>
  );
}
