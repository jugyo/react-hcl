/**
 * Networking Module
 *
 * Defines a VPC and private subnet for use by other modules.
 */
import { Output, Resource, Terraform, tf, useRef, Variable } from "react-hcl";

function Main() {
  const vpc = useRef();
  const subnet = useRef();

  return (
    <>
      <Terraform
        required_version=">= 1.2.8"
        required_providers={{
          aws: {
            source: "hashicorp/aws",
            version: "~> 6.0",
          },
        }}
      />
      <Variable
        label="vpc_cidr"
        type="string"
        description="CIDR block for the VPC"
      />
      <Variable
        label="environment"
        type="string"
        description="Environment name"
      />

      <Resource
        ref={vpc}
        type="aws_vpc"
        label="main"
        cidr_block={tf.var("vpc_cidr")}
        tags={{ Name: tf.var("environment") }}
      />

      <Resource
        ref={subnet}
        type="aws_subnet"
        label="private"
        vpc_id={vpc.id}
        cidr_block="10.0.1.0/24"
        tags={{ Name: "private" }}
      />

      <Output label="vpc_id" value={vpc.id} />
      <Output label="private_subnet_ids" value={[subnet.id]} />
    </>
  );
}

export default <Main />;
