import { Output, Resource, tf, useRef } from "react-hcl";

export function PrivateNetwork({
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
  const eipRef = useRef();
  const natRef = useRef();
  const subnetRefs = Array.from({ length: subnetCount }, () => useRef());

  return (
    <>
      {subnetRefs.map((ref, i) => (
        <Resource
          type="aws_subnet"
          label={`private_${i}`}
          ref={ref}
          vpc_id={vpcRef.id}
          cidr_block={tf.raw(`cidrsubnet("${vpcCidr}", 8, ${i + 100})`)}
          availability_zone={tf.raw(`${azRef.names}[${i}]`)}
          tags={{ Name: `${projectName}-private-${i}` }}
        />
      ))}

      <Resource
        type="aws_eip"
        label="nat"
        ref={eipRef}
        domain="vpc"
        tags={{ Name: `${projectName}-nat-eip` }}
      />

      <Resource
        type="aws_nat_gateway"
        label="main"
        ref={natRef}
        allocation_id={eipRef.id}
        subnet_id={natSubnetRef.id}
        depends_on={[eipRef, igwRef]}
        tags={{ Name: `${projectName}-nat` }}
      />

      <Resource
        type="aws_route_table"
        label="private"
        ref={rtRef}
        vpc_id={vpcRef.id}
        tags={{ Name: `${projectName}-private-rt` }}
      />

      <Resource
        type="aws_route"
        label="private_internet_access"
        route_table_id={rtRef.id}
        destination_cidr_block="0.0.0.0/0"
        nat_gateway_id={natRef.id}
      />

      {subnetRefs.map((ref, i) => (
        <Resource
          type="aws_route_table_association"
          label={`private_${i}`}
          subnet_id={ref.id}
          route_table_id={rtRef.id}
        />
      ))}

      <Output
        label="private_subnet_ids"
        value={tf.raw(`[${subnetRefs.map((r) => r.id).join(", ")}]`)}
      />
    </>
  );
}
