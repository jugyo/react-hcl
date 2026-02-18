import { Resource, useRef } from "react-hcl";

export function EcsService({
  vpcRef,
  lbSgRef,
  tgRef,
  listenerRef,
  privateSubnetRefs,
  appImage,
  appPort,
  appCount,
  fargateCpu,
  fargateMemory,
}: {
  vpcRef: any;
  lbSgRef: any;
  tgRef: any;
  listenerRef: any;
  privateSubnetRefs: any[];
  appImage: string;
  appPort: number;
  appCount: number;
  fargateCpu: number;
  fargateMemory: number;
}) {
  const taskSgRef = useRef();
  const clusterRef = useRef();
  const taskDefRef = useRef();

  return (
    <>
      <Resource type="aws_security_group" label="ecs_tasks" ref={taskSgRef}>
        {`
          name        = "tf-ecs-tasks"
          description = "allow inbound access from the ALB only"
          vpc_id      = ${vpcRef.id}

          ingress {
            protocol        = "tcp"
            from_port       = ${appPort}
            to_port         = ${appPort}
            security_groups = [${lbSgRef.id}]
          }

          egress {
            protocol    = "-1"
            from_port   = 0
            to_port     = 0
            cidr_blocks = ["0.0.0.0/0"]
          }
        `}
      </Resource>

      <Resource type="aws_ecs_cluster" label="main" ref={clusterRef}>
        {`
          name = "tf-ecs-cluster"
        `}
      </Resource>

      <Resource type="aws_ecs_task_definition" label="app" ref={taskDefRef}>
        {`
          family                   = "app"
          network_mode             = "awsvpc"
          requires_compatibilities = ["FARGATE"]
          cpu                      = ${fargateCpu}
          memory                   = ${fargateMemory}

          container_definitions = jsonencode([
            {
              cpu          = ${fargateCpu}
              image        = "${appImage}"
              memory       = ${fargateMemory}
              name         = "app"
              networkMode  = "awsvpc"
              portMappings = [
                {
                  containerPort = ${appPort}
                  hostPort      = ${appPort}
                }
              ]
            }
          ])
        `}
      </Resource>

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
    </>
  );
}
