/**
 * Module Composition
 *
 * Demonstrates composing local modules with depends_on
 * and referencing module outputs via useRef.
 */
import { Module, Output, Provider, Terraform, useRef } from "react-hcl";

function Main() {
  const network = useRef();
  const database = useRef();

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
      <Provider type="aws" region="us-east-1" />

      <Module
        ref={network}
        label="networking"
        source="./modules/networking"
        vpc_cidr="10.0.0.0/16"
        environment="production"
      />

      <Module
        ref={database}
        label="database"
        source="./modules/rds"
        vpc_id={network.vpc_id}
        subnet_ids={network.private_subnet_ids}
        depends_on={[network]}
      />

      <Output label="vpc_id" value={network.vpc_id} />
      <Output label="database_endpoint" value={database.endpoint} />
    </>
  );
}

export default <Main />;
