import { Resource, useRef } from "react-hcl";

function App() {
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
        type="aws_instance"
        label="web"
        ami="ami-xxx"
        instance_type="t3.micro"
        depends_on={[vpcRef]}
      />
    </>
  );
}

export default <App />;
