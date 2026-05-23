# ECS Fargate

Source: `examples/ecs-fargate-simplified`

## What This Example Shows

This example builds an ECS Fargate service behind an Application Load Balancer.

It demonstrates:

- splitting infrastructure concerns into composite components
- passing refs between components
- using TypeScript values for environment shape
- using HCL body text for complex ECS and ALB blocks

## Input Structure

```text
examples/ecs-fargate-simplified/
  input/main.tsx
  input/network.tsx
  input/alb.tsx
  input/alb-listener.tsx
  input/ecs-service.tsx
  output/main.tf
```

## Key TSX Snippet

```tsx
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
```

## ECS Service Snippet

```tsx
<Resource type="aws_ecs_service" label="main">
  {`
    name            = "tf-ecs-service"
    cluster         = ${clusterRef.id}
    task_definition = ${taskDefRef.arn}
    desired_count   = ${appCount}
    launch_type     = "FARGATE"

    network_configuration {
      security_groups = [${taskSgRef.id}]
      subnets         = [${privateSubnetRefs.map((r) => r.id).join(", ")}]
    }

    depends_on = [${listenerRef.__dependsOnValue}]
  `}
</Resource>
```

## Generated HCL Snippet

```hcl
resource "aws_ecs_service" "main" {
  name            = "tf-ecs-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.ecs_tasks.id]
    subnets         = [aws_subnet.private_0.id, aws_subnet.private_1.id]
  }

  depends_on = [aws_alb_listener.front_end]
}
```

## Notes

The TSX source groups the network, load balancer, listener, and service into separate components. The generated HCL is still a flat Terraform configuration with normal resource references.
