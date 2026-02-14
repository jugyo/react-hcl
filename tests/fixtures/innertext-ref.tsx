import { Resource, useRef } from "react-terraform";

function App() {
  const vpcRef = useRef();
  return (
    <>
      <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
      <Resource type="aws_security_group" name="web">
        {`ingress {
  from_port   = 80
  to_port     = 80
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}

egress {
  from_port   = 0
  to_port     = 0
  protocol    = "-1"
  cidr_blocks = ["0.0.0.0/0"]
}

vpc_id = ${vpcRef.id}`}
      </Resource>
    </>
  );
}

export default <App />;
