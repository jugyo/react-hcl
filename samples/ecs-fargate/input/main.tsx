/**
 * ECS Fargate Service with ALB
 *
 * VPC + Subnets + NAT + ALB + Security Groups + ECS Cluster/Task/Service.
 * Based on: https://github.com/Oxalide/terraform-fargate-example
 */
import {
  DataSource,
  Output,
  Provider,
  Resource,
  raw,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function Main({ region }: { region: string }) {
  const azRef = useRef();
  const vpcRef = useRef();
  const igwRef = useRef();
  const lbSgRef = useRef();
  const taskSgRef = useRef();
  const albRef = useRef();
  const tgRef = useRef();
  const listenerRef = useRef();
  const clusterRef = useRef();
  const taskDefRef = useRef();

  return (
    <>
      <Provider type="aws" region={region} />

      <Variable
        name="az_count"
        description="Number of AZs to cover in a given AWS region"
        default="2"
      />
      <Variable
        name="app_image"
        description="Docker image to run in the ECS cluster"
        default="adongy/hostname-docker:latest"
      />
      <Variable
        name="app_port"
        description="Port exposed by the docker image to redirect traffic to"
        default={3000}
      />
      <Variable
        name="app_count"
        description="Number of docker containers to run"
        default={2}
      />
      <Variable
        name="fargate_cpu"
        description="Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
        default="256"
      />
      <Variable
        name="fargate_memory"
        description="Fargate instance memory to provision (in MiB)"
        default="512"
      />

      <DataSource type="aws_availability_zones" name="available" ref={azRef} />

      {/* Network */}
      <Resource
        type="aws_vpc"
        name="main"
        ref={vpcRef}
        cidr_block="172.17.0.0/16"
      />

      <Resource type="aws_subnet" name="private">
        {`
          count             = ${tf.var("az_count")}
          cidr_block        = cidrsubnet(${vpcRef.cidr_block}, 8, count.index)
          availability_zone = ${azRef.names}[count.index]
          vpc_id            = ${vpcRef.id}
        `}
      </Resource>

      <Resource type="aws_subnet" name="public">
        {`
          count                   = ${tf.var("az_count")}
          cidr_block              = cidrsubnet(${vpcRef.cidr_block}, 8, ${tf.var("az_count")} + count.index)
          availability_zone       = ${azRef.names}[count.index]
          vpc_id                  = ${vpcRef.id}
          map_public_ip_on_launch = true
        `}
      </Resource>

      <Resource
        type="aws_internet_gateway"
        name="gw"
        ref={igwRef}
        vpc_id={vpcRef.id}
      />

      <Resource
        type="aws_route"
        name="internet_access"
        route_table_id={raw(`${vpcRef.main_route_table_id}`)}
        destination_cidr_block="0.0.0.0/0"
        gateway_id={igwRef.id}
      />

      <Resource type="aws_eip" name="gw">
        {`
          count      = ${tf.var("az_count")}
          vpc        = true
          depends_on = [${igwRef.__dependsOnValue}]
        `}
      </Resource>

      <Resource type="aws_nat_gateway" name="gw">
        {`
          count         = ${tf.var("az_count")}
          subnet_id     = element(aws_subnet.public.*.id, count.index)
          allocation_id = element(aws_eip.gw.*.id, count.index)
        `}
      </Resource>

      <Resource type="aws_route_table" name="private">
        {`
          count  = ${tf.var("az_count")}
          vpc_id = ${vpcRef.id}

          route {
            cidr_block     = "0.0.0.0/0"
            nat_gateway_id = element(aws_nat_gateway.gw.*.id, count.index)
          }
        `}
      </Resource>

      <Resource type="aws_route_table_association" name="private">
        {`
          count          = ${tf.var("az_count")}
          subnet_id      = element(aws_subnet.private.*.id, count.index)
          route_table_id = element(aws_route_table.private.*.id, count.index)
        `}
      </Resource>

      {/* Security */}
      <Resource type="aws_security_group" name="lb" ref={lbSgRef}>
        {`
          name        = "tf-ecs-alb"
          description = "controls access to the ALB"
          vpc_id      = ${vpcRef.id}

          ingress {
            protocol    = "tcp"
            from_port   = 80
            to_port     = 80
            cidr_blocks = ["0.0.0.0/0"]
          }

          egress {
            from_port   = 0
            to_port     = 0
            protocol    = "-1"
            cidr_blocks = ["0.0.0.0/0"]
          }
        `}
      </Resource>

      <Resource type="aws_security_group" name="ecs_tasks" ref={taskSgRef}>
        {`
          name        = "tf-ecs-tasks"
          description = "allow inbound access from the ALB only"
          vpc_id      = ${vpcRef.id}

          ingress {
            protocol        = "tcp"
            from_port       = ${tf.var("app_port")}
            to_port         = ${tf.var("app_port")}
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

      {/* ALB */}
      <Resource type="aws_alb" name="main" ref={albRef}>
        {`
          name            = "tf-ecs-chat"
          subnets         = aws_subnet.public.*.id
          security_groups = [${lbSgRef.id}]
        `}
      </Resource>

      <Resource type="aws_alb_target_group" name="app" ref={tgRef}>
        {`
          name        = "tf-ecs-chat"
          port        = 80
          protocol    = "HTTP"
          vpc_id      = ${vpcRef.id}
          target_type = "ip"
        `}
      </Resource>

      <Resource type="aws_alb_listener" name="front_end" ref={listenerRef}>
        {`
          load_balancer_arn = ${albRef.id}
          port              = "80"
          protocol          = "HTTP"

          default_action {
            target_group_arn = ${tgRef.id}
            type             = "forward"
          }
        `}
      </Resource>

      {/* ECS */}
      <Resource type="aws_ecs_cluster" name="main" ref={clusterRef}>
        {`
          name = "tf-ecs-cluster"
        `}
      </Resource>

      <Resource type="aws_ecs_task_definition" name="app" ref={taskDefRef}>
        {`
          family                   = "app"
          network_mode             = "awsvpc"
          requires_compatibilities = ["FARGATE"]
          cpu                      = ${tf.var("fargate_cpu")}
          memory                   = ${tf.var("fargate_memory")}

          container_definitions = <<-DEFINITION
            [
              {
                "cpu": \${var.fargate_cpu},
                "image": "\${var.app_image}",
                "memory": \${var.fargate_memory},
                "name": "app",
                "networkMode": "awsvpc",
                "portMappings": [
                  {
                    "containerPort": \${var.app_port},
                    "hostPort": \${var.app_port}
                  }
                ]
              }
            ]
          DEFINITION
        `}
      </Resource>

      <Resource type="aws_ecs_service" name="main">
        {`
          name            = "tf-ecs-service"
          cluster         = ${clusterRef.id}
          task_definition = ${taskDefRef.arn}
          desired_count   = ${tf.var("app_count")}
          launch_type     = "FARGATE"

          network_configuration {
            security_groups = [${taskSgRef.id}]
            subnets         = aws_subnet.private.*.id
          }

          load_balancer {
            target_group_arn = ${tgRef.id}
            container_name   = "app"
            container_port   = ${tf.var("app_port")}
          }

          depends_on = [${listenerRef.__dependsOnValue}]
        `}
      </Resource>

      {/* Outputs */}
      <Output name="alb_hostname" value={albRef.dns_name} />
    </>
  );
}

export default <Main region="us-east-1" />;
