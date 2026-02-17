import {
  Data,
  Output,
  Provider,
  Resource,
  Terraform,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function Main({ region }: { region: string }) {
  const defaultVpcRef = useRef();
  const defaultSubnetsRef = useRef();
  const dbSgRef = useRef();
  const subnetGroupRef = useRef();
  const dbRef = useRef();

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
      <Provider type="aws" region={region} />

      <Variable
        label="db_password"
        type="string"
        sensitive={true}
        description="Master password for the PostgreSQL instance"
      />

      <Data type="aws_vpc" label="default" ref={defaultVpcRef} default={true} />
      <Data
        type="aws_subnets"
        label="default"
        ref={defaultSubnetsRef}
        filter={[
          {
            name: "vpc-id",
            values: [defaultVpcRef.id],
          },
        ]}
      />

      <Resource
        type="aws_security_group"
        label="rds"
        ref={dbSgRef}
        vpc_id={defaultVpcRef.id}
        description="RDS security group"
      />

      <Resource
        type="aws_vpc_security_group_ingress_rule"
        label="rds_postgres"
        security_group_id={dbSgRef.id}
        from_port={5432}
        to_port={5432}
        ip_protocol="tcp"
        cidr_ipv4={defaultVpcRef.cidr_block}
      />

      <Resource
        type="aws_vpc_security_group_egress_rule"
        label="rds_all"
        security_group_id={dbSgRef.id}
        ip_protocol="-1"
        cidr_ipv4="0.0.0.0/0"
      />

      <Resource
        type="aws_db_subnet_group"
        label="main"
        ref={subnetGroupRef}
        name_prefix="example-rds-"
        subnet_ids={defaultSubnetsRef.ids}
      />

      <Resource
        type="aws_db_instance"
        label="main"
        ref={dbRef}
        identifier="react-hcl-rds-example"
        engine="postgres"
        engine_version="16.3"
        instance_class="db.t4g.micro"
        allocated_storage={20}
        db_name="app"
        username="app"
        password={tf.var("db_password")}
        db_subnet_group_name={subnetGroupRef.name}
        vpc_security_group_ids={[dbSgRef.id]}
        publicly_accessible={false}
        storage_encrypted={true}
        skip_final_snapshot={true}
        backup_retention_period={7}
        lifecycle={{ prevent_destroy: true }}
      />

      <Output label="db_endpoint" value={dbRef.endpoint} />
      <Output label="db_arn" value={dbRef.arn} />
    </>
  );
}

export default <Main region="ap-northeast-1" />;
