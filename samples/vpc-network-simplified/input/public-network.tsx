import { Output, Resource, raw, useRef } from "react-terraform";

export function PublicNetwork({
  vpcRef,
  azRef,
  igwRef,
  natSubnetRef,
  vpcCidr,
  subnetCount,
  projectName,
}: {
  vpcRef: any;
  azRef: any;
  igwRef: any;
  natSubnetRef: any;
  vpcCidr: string;
  subnetCount: number;
  projectName: string;
}) {
  const rtRef = useRef();
  const subnetRefs = Array.from({ length: subnetCount - 1 }, () => useRef());
  const allSubnetRefs = [natSubnetRef, ...subnetRefs];

  return (
    <>
      {subnetRefs.map((ref, i) => (
        <Resource
          type="aws_subnet"
          name={`public_${i + 1}`}
          ref={ref}
          vpc_id={vpcRef.id}
          cidr_block={raw(`cidrsubnet("${vpcCidr}", 8, ${i + 1})`)}
          availability_zone={raw(`${azRef.names}[${i + 1}]`)}
          map_public_ip_on_launch={true}
          tags={{ Name: `${projectName}-public-${i + 1}` }}
        />
      ))}

      <Resource
        type="aws_internet_gateway"
        name="main"
        ref={igwRef}
        vpc_id={vpcRef.id}
        tags={{ Name: `${projectName}-igw` }}
      />

      <Resource
        type="aws_route_table"
        name="public"
        ref={rtRef}
        vpc_id={vpcRef.id}
        tags={{ Name: `${projectName}-public-rt` }}
      />

      <Resource
        type="aws_route"
        name="public_internet_access"
        route_table_id={rtRef.id}
        destination_cidr_block="0.0.0.0/0"
        gateway_id={igwRef.id}
      />

      {allSubnetRefs.map((ref, i) => (
        <Resource
          type="aws_route_table_association"
          name={`public_${i}`}
          subnet_id={ref.id}
          route_table_id={rtRef.id}
        />
      ))}

      <Output
        name="public_subnet_ids"
        value={raw(`[${allSubnetRefs.map((r) => r.id).join(", ")}]`)}
      />
    </>
  );
}
