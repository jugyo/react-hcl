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
      <Resource type="aws_security_group" label="example">
        {`
          name   = "example"
          vpc_id = ${vpcRef.id}

          dynamic "ingress" {
            for_each = var.additional_ports
            content {
              from_port   = ingress.value
              to_port     = ingress.value
              protocol    = "tcp"
              cidr_blocks = ["0.0.0.0/0"]
            }
          }
        `}
      </Resource>
    </>
  );
}

export default <App />;
