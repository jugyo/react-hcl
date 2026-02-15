/**
 * RDS Module
 *
 * Defines an RDS database instance with subnet group.
 */
import { Output, Resource, tf, useRef, Variable } from "react-hcl";

function Main() {
  const subnetGroup = useRef();
  const db = useRef();

  return (
    <>
      <Variable name="vpc_id" type="string" description="VPC ID" />
      <Variable
        name="subnet_ids"
        type="list(string)"
        description="Subnet IDs for the DB subnet group"
      />

      <Resource
        ref={subnetGroup}
        type="aws_db_subnet_group"
        name="main"
        subnet_ids={tf.var("subnet_ids")}
        tags={{ Name: "db-subnet-group" }}
      />

      <Resource
        ref={db}
        type="aws_db_instance"
        name="main"
        engine="mysql"
        engine_version="8.0"
        instance_class="db.t3.micro"
        allocated_storage={20}
        db_subnet_group_name={subnetGroup.name}
        skip_final_snapshot={true}
        tags={{ Name: "main-db" }}
      />

      <Output name="endpoint" value={db.endpoint} />
    </>
  );
}

export default <Main />;
