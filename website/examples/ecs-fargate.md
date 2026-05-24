# ECS Fargate

## What This Example Shows

This example uses an ECS Fargate service behind an Application Load Balancer to show larger component boundaries.

It demonstrates:

- splitting infrastructure concerns into composite components
- passing refs between components
- using TypeScript values for environment shape
- using HCL body text for complex ECS and ALB blocks

## Key TSX Snippet

```tsx
const azCount = 2;
const vpcCidr = "172.17.0.0/16";
const appImage = "adongy/hostname-docker:latest";
const appPort = 3000;
const appCount = 2;
const fargateCpu = 256;
const fargateMemory = 512;

const azRef = useRef();
const vpcRef = useRef();
const igwRef = useRef();
const publicSubnetRefs = Array.from({ length: azCount }, () => useRef());
const privateSubnetRefs = Array.from({ length: azCount }, () => useRef());
const lbSgRef = useRef();
const albRef = useRef();
const tgRef = useRef();
const listenerRef = useRef();

<Data type="aws_availability_zones" label="available" ref={azRef} />
<Resource type="aws_vpc" label="main" ref={vpcRef} cidr_block={vpcCidr} />

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
```

## ECS Service Snippet

```tsx
const taskSgRef = useRef();
const clusterRef = useRef();
const taskDefRef = useRef();

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

    load_balancer {
      target_group_arn = ${tgRef.id}
      container_name   = "app"
      container_port   = ${appPort}
    }

    depends_on = [${listenerRef.__dependsOnValue}]
  `}
</Resource>
```

## Generated HCL Snippet

```hcl
resource "aws_alb_target_group" "app" {
  name        = "tf-ecs-chat"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
}

resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.main.id
  port              = "80"
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.app.id
    type             = "forward"
  }
}

resource "aws_ecs_cluster" "main" {
  name = "tf-ecs-cluster"
}

resource "aws_ecs_task_definition" "app" {
  family                   = "app"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  container_definitions = jsonencode([
    {
      cpu          = 256
      image        = "adongy/hostname-docker:latest"
      memory       = 512
      name         = "app"
      networkMode  = "awsvpc"
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}

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

  load_balancer {
    target_group_arn = aws_alb_target_group.app.id
    container_name   = "app"
    container_port   = 3000
  }

  depends_on = [aws_alb_listener.front_end]
}
```

## Takeaway

The TSX source groups network, load balancer, listener, and service resources into separate components. The generated HCL remains a flat Terraform configuration with normal resource references.
