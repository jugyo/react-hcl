import { Resource, useRef } from "react-terraform";

function App() {
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
        type="aws_instance"
        name="web"
        ami="ami-xxx"
        instance_type="t3.micro"
        depends_on={[vpcRef]}
      />
    </>
  );
}

export default <App />;
