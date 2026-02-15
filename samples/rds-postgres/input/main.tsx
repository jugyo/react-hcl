import {
  DataSource,
  Output,
  Provider,
  Resource,
  Terraform,
  useRef,
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
            version: "~> 5.0",
          },
        }}
      />
      <Provider type="aws" region={region} />

      <DataSource
        type="aws_vpc"
        name="default"
        ref={defaultVpcRef}
        default={true}
      />
      <DataSource
        type="aws_subnets"
        name="default"
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
        name="rds"
        ref={dbSgRef}
        vpc_id={defaultVpcRef.id}
        description="RDS security group"
      />

      <Resource
        type="aws_vpc_security_group_ingress_rule"
        name="rds_postgres"
        security_group_id={dbSgRef.id}
        from_port={5432}
        to_port={5432}
        ip_protocol="tcp"
        cidr_ipv4="10.0.0.0/16"
      />

      <Resource
        type="aws_vpc_security_group_egress_rule"
        name="rds_all"
        security_group_id={dbSgRef.id}
        ip_protocol="-1"
        cidr_ipv4="0.0.0.0/0"
      />

      <Resource
        type="aws_db_subnet_group"
        name="main"
        ref={subnetGroupRef}
        name_prefix="example-rds-"
        subnet_ids={defaultSubnetsRef.ids}
      />

      <Resource
        type="aws_db_instance"
        name="main"
        ref={dbRef}
        identifier="react-hcl-rds-example"
        engine="postgres"
        engine_version="16.3"
        instance_class="db.t4g.micro"
        allocated_storage={20}
        db_name="app"
        username="app"
        password="example-password-change-me"
        db_subnet_group_name={subnetGroupRef.name}
        vpc_security_group_ids={[dbSgRef.id]}
        publicly_accessible={false}
        storage_encrypted={true}
        skip_final_snapshot={true}
        backup_retention_period={7}
        lifecycle={{ prevent_destroy: true }}
      />

      <Output name="db_endpoint" value={dbRef.endpoint} />
      <Output name="db_arn" value={dbRef.arn} />
    </>
  );
}

export default <Main region="ap-northeast-1" />;
