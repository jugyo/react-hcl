import { Output, Resource, useRef } from "react-hcl";

function VpcModule({ cidr, vpcRef }: { cidr: string; vpcRef: any }) {
  return (
    <>
      <Resource
        type="aws_vpc"
        name="main"
        ref={vpcRef}
        cidr_block={cidr}
        enable_dns_hostnames={true}
      />
      <Resource
        type="aws_subnet"
        name="public"
        vpc_id={vpcRef.id}
        cidr_block="10.0.1.0/24"
      />
    </>
  );
}

const vpcRef = useRef();

export default (
  <>
    <VpcModule cidr="10.0.0.0/16" vpcRef={vpcRef} />
    <Output name="vpc_id" value={vpcRef.id} />
  </>
);
