/**
 * Module Composition
 *
 * Demonstrates composing local modules with depends_on
 * and referencing module outputs via useRef.
 */
import { Module, Output, Provider, useRef } from "react-hcl";

function Main() {
  const network = useRef();
  const database = useRef();

  return (
    <>
      <Provider type="aws" region="us-east-1" />

      <Module
        ref={network}
        name="networking"
        source="./modules/networking"
        vpc_cidr="10.0.0.0/16"
        environment="production"
      />

      <Module
        ref={database}
        name="database"
        source="./modules/rds"
        vpc_id={network.vpc_id}
        subnet_ids={network.private_subnet_ids}
        depends_on={[network]}
      />

      <Output name="vpc_id" value={network.vpc_id} />
      <Output name="database_endpoint" value={database.endpoint} />
    </>
  );
}

export default <Main />;
