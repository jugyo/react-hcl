import { Resource, tf, useRef } from "react-hcl";

export function Network({
  vpcRef,
  azRef,
  igwRef,
  publicSubnetRefs,
  privateSubnetRefs,
  azCount,
  vpcCidr,
}: {
  vpcRef: any;
  azRef: any;
  igwRef: any;
  publicSubnetRefs: any[];
  privateSubnetRefs: any[];
  azCount: number;
  vpcCidr: string;
}) {
  const eipRefs = Array.from({ length: azCount }, () => useRef());
  const natRefs = Array.from({ length: azCount }, () => useRef());
  const privateRtRefs = Array.from({ length: azCount }, () => useRef());

  return (
    <>
      {privateSubnetRefs.map((ref, i) => (
        <Resource
          type="aws_subnet"
          label={`private_${i}`}
          ref={ref}
          vpc_id={vpcRef.id}
          cidr_block={tf.raw(`cidrsubnet("${vpcCidr}", 8, ${i})`)}
          availability_zone={tf.raw(`${azRef.names}[${i}]`)}
        />
      ))}

      {publicSubnetRefs.map((ref, i) => (
        <Resource
          type="aws_subnet"
          label={`public_${i}`}
          ref={ref}
          vpc_id={vpcRef.id}
          cidr_block={tf.raw(`cidrsubnet("${vpcCidr}", 8, ${azCount + i})`)}
          availability_zone={tf.raw(`${azRef.names}[${i}]`)}
          map_public_ip_on_launch={true}
        />
      ))}

      <Resource
        type="aws_internet_gateway"
        label="gw"
        ref={igwRef}
        vpc_id={vpcRef.id}
      />

      <Resource
        type="aws_route"
        label="internet_access"
        route_table_id={tf.raw(`${vpcRef.main_route_table_id}`)}
        destination_cidr_block="0.0.0.0/0"
        gateway_id={igwRef.id}
      />

      {eipRefs.map((ref, i) => (
        <Resource
          type="aws_eip"
          label={`gw_${i}`}
          ref={ref}
          domain="vpc"
          depends_on={[igwRef]}
        />
      ))}

      {natRefs.map((ref, i) => (
        <Resource
          type="aws_nat_gateway"
          label={`gw_${i}`}
          ref={ref}
          subnet_id={publicSubnetRefs[i].id}
          allocation_id={eipRefs[i].id}
        />
      ))}

      {privateRtRefs.map((ref, i) => (
        <Resource
          type="aws_route_table"
          label={`private_${i}`}
          ref={ref}
          vpc_id={vpcRef.id}
        />
      ))}

      {privateRtRefs.map((ref, i) => (
        <Resource
          type="aws_route"
          label={`private_${i}`}
          route_table_id={ref.id}
          destination_cidr_block="0.0.0.0/0"
          nat_gateway_id={natRefs[i].id}
        />
      ))}

      {privateSubnetRefs.map((ref, i) => (
        <Resource
          type="aws_route_table_association"
          label={`private_${i}`}
          subnet_id={ref.id}
          route_table_id={privateRtRefs[i].id}
        />
      ))}
    </>
  );
}
