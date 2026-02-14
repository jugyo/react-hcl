import { Resource, useRef } from "react-terraform";

export default function App() {
  const vpcRef = useRef();
  return (
    <>
      <Resource
        type="aws_vpc"
        name="main"
        ref={vpcRef}
        cidr_block="10.0.0.0/16"
      />
      <Resource
        type="aws_subnet"
        name="public"
        vpc_id={vpcRef.id}
        cidr_block="10.0.1.0/24"
      />
    </>
  );
}
