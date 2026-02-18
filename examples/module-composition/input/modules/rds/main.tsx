/**
 * RDS Module
 *
 * Defines an RDS database instance with subnet group.
 */
import { Output, Resource, Terraform, tf, useRef, Variable } from "react-hcl";

function Main() {
  const subnetGroup = useRef();
  const db = useRef();

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
      <Variable label="vpc_id" type="string" description="VPC ID" />
      <Variable
        label="subnet_ids"
        type="list(string)"
        description="Subnet IDs for the DB subnet group"
      />

      <Resource
        ref={subnetGroup}
        type="aws_db_subnet_group"
        label="main"
        subnet_ids={tf.var("subnet_ids")}
        tags={{ Name: "db-subnet-group" }}
      />

      <Resource
        ref={db}
        type="aws_db_instance"
        label="main"
        engine="mysql"
        engine_version="8.0"
        instance_class="db.t3.micro"
        allocated_storage={20}
        db_subnet_group_name={subnetGroup.name}
        skip_final_snapshot={true}
        tags={{ Name: "main-db" }}
      />

      <Output label="endpoint" value={db.endpoint} />
    </>
  );
}

export default <Main />;
