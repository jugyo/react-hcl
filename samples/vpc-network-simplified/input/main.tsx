/**
 * VPC Network with Public/Private Subnets (Simplified)
 *
 * Same infrastructure as vpc-network, but using TypeScript values
 * instead of Terraform variables, and TypeScript loops instead of count.
 * Resources are grouped into composite components (PublicNetwork, PrivateNetwork).
 */
import {
  DataSource,
  Output,
  Provider,
  Resource,
  raw,
  Terraform,
  useRef,
} from "react-hcl";
import { PrivateNetwork } from "./private-network";
import { PublicNetwork } from "./public-network";

function Main({
  vpcCidr,
  publicSubnetCount,
  privateSubnetCount,
  projectName,
  region,
}: {
  vpcCidr: string;
  publicSubnetCount: number;
  privateSubnetCount: number;
  projectName: string;
  region: string;
}) {
  const azRef = useRef();
  const vpcRef = useRef();
  const igwRef = useRef();
  const natSubnetRef = useRef();

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

      <DataSource type="aws_availability_zones" name="available" ref={azRef} />

      <Resource
        type="aws_vpc"
        name="main"
        ref={vpcRef}
        cidr_block={vpcCidr}
        enable_dns_hostnames={true}
        enable_dns_support={true}
        tags={{ Name: `${projectName}-vpc` }}
      />

      <Resource
        type="aws_subnet"
        name="public_0"
        ref={natSubnetRef}
        vpc_id={vpcRef.id}
        cidr_block={raw(`cidrsubnet("${vpcCidr}", 8, 0)`)}
        availability_zone={raw(`${azRef.names}[0]`)}
        map_public_ip_on_launch={true}
        tags={{ Name: `${projectName}-public-0` }}
      />

      <PublicNetwork
        vpcRef={vpcRef}
        azRef={azRef}
        igwRef={igwRef}
        natSubnetRef={natSubnetRef}
        vpcCidr={vpcCidr}
        subnetCount={publicSubnetCount}
        projectName={projectName}
      />

      <PrivateNetwork
        vpcRef={vpcRef}
        azRef={azRef}
        igwRef={igwRef}
        natSubnetRef={natSubnetRef}
        vpcCidr={vpcCidr}
        subnetCount={privateSubnetCount}
        projectName={projectName}
      />

      <Output name="vpc_id" value={vpcRef.id} />
    </>
  );
}

export default (
  <Main
    vpcCidr="10.0.0.0/16"
    publicSubnetCount={2}
    privateSubnetCount={2}
    projectName="demo"
    region="ap-northeast-1"
  />
);
