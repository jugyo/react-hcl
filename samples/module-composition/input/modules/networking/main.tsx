/**
 * Networking Module
 *
 * Defines a VPC and private subnet for use by other modules.
 */
import { Output, Resource, tf, useRef, Variable } from "react-hcl";

function Main() {
  const vpc = useRef();
  const subnet = useRef();

  return (
    <>
      <Variable
        name="vpc_cidr"
        type="string"
        description="CIDR block for the VPC"
      />
      <Variable
        name="environment"
        type="string"
        description="Environment name"
      />

      <Resource
        ref={vpc}
        type="aws_vpc"
        name="main"
        cidr_block={tf.var("vpc_cidr")}
        tags={{ Name: tf.var("environment") }}
      />

      <Resource
        ref={subnet}
        type="aws_subnet"
        name="private"
        vpc_id={vpc.id}
        cidr_block="10.0.1.0/24"
        tags={{ Name: "private" }}
      />

      <Output name="vpc_id" value={vpc.id} />
      <Output name="private_subnet_ids" value={[subnet.id]} />
    </>
  );
}

export default <Main />;
