/**
 * ECS Fargate Service with ALB (Simplified)
 *
 * Same infrastructure as ecs-fargate, but using TypeScript values
 * instead of Terraform variables, TypeScript loops instead of count,
 * and composite components for each infrastructure concern.
 */
import {
  DataSource,
  Output,
  Provider,
  Resource,
  useRef,
} from "react-terraform";
import { Alb } from "./alb";
import { AlbListener } from "./alb-listener";
import { EcsService } from "./ecs-service";
import { Network } from "./network";

function Main({
  region,
  vpcCidr,
  azCount,
  appImage,
  appPort,
  appCount,
  fargateCpu,
  fargateMemory,
}: {
  region: string;
  vpcCidr: string;
  azCount: number;
  appImage: string;
  appPort: number;
  appCount: number;
  fargateCpu: number;
  fargateMemory: number;
}) {
  const azRef = useRef();
  const vpcRef = useRef();
  const igwRef = useRef();
  const publicSubnetRefs = Array.from({ length: azCount }, () => useRef());
  const privateSubnetRefs = Array.from({ length: azCount }, () => useRef());
  const lbSgRef = useRef();
  const albRef = useRef();
  const tgRef = useRef();
  const listenerRef = useRef();

  return (
    <>
      <Provider type="aws" region={region} />

      <DataSource type="aws_availability_zones" name="available" ref={azRef} />

      <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block={vpcCidr} />

      <Network
        vpcRef={vpcRef}
        azRef={azRef}
        igwRef={igwRef}
        publicSubnetRefs={publicSubnetRefs}
        privateSubnetRefs={privateSubnetRefs}
        azCount={azCount}
        vpcCidr={vpcCidr}
      />

      <Alb
        vpcRef={vpcRef}
        lbSgRef={lbSgRef}
        albRef={albRef}
        publicSubnetRefs={publicSubnetRefs}
      />

      <AlbListener
        albRef={albRef}
        vpcRef={vpcRef}
        tgRef={tgRef}
        listenerRef={listenerRef}
      />

      <EcsService
        vpcRef={vpcRef}
        lbSgRef={lbSgRef}
        tgRef={tgRef}
        listenerRef={listenerRef}
        privateSubnetRefs={privateSubnetRefs}
        appImage={appImage}
        appPort={appPort}
        appCount={appCount}
        fargateCpu={fargateCpu}
        fargateMemory={fargateMemory}
      />

      <Output name="alb_hostname" value={albRef.dns_name} />
    </>
  );
}

export default (
  <Main
    region="us-east-1"
    vpcCidr="172.17.0.0/16"
    azCount={2}
    appImage="adongy/hostname-docker:latest"
    appPort={3000}
    appCount={2}
    fargateCpu={256}
    fargateMemory={512}
  />
);
