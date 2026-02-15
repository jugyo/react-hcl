/**
 * Cluster Web Server on AWS
 *
 * Auto Scaling Group + ALB + Launch Template + Security Groups.
 * Based on: https://github.com/alfonsof/terraform-aws-examples/tree/master/code/05-cluster-webserver
 */
import {
  DataSource,
  Output,
  Provider,
  Resource,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function ClusterWebServer() {
  const amiRef = useRef();
  const defaultVpcRef = useRef();
  const defaultSubnetsRef = useRef();
  const instanceSgRef = useRef();
  const albSgRef = useRef();
  const launchTemplateRef = useRef();
  const targetGroupRef = useRef();
  const albRef = useRef();

  return (
    <>
      <Provider type="aws" region="eu-west-1" />

      <Variable
        name="server_port"
        description="The port the server will use for HTTP requests"
        default="8080"
      />

      <DataSource
        type="aws_vpc"
        name="default"
        ref={defaultVpcRef}
        default={true}
      />
      <DataSource
        type="aws_subnets"
        name="default"
        ref={defaultSubnetsRef}
        filter={[
          {
            name: "vpc-id",
            values: [defaultVpcRef.id],
          },
        ]}
      />
      <DataSource
        type="aws_ami"
        name="amazon_linux"
        ref={amiRef}
        most_recent={true}
        owners={["amazon"]}
        filter={[
          {
            name: "name",
            values: ["al2023-ami-*-kernel-6.1-x86_64"],
          },
          {
            name: "virtualization-type",
            values: ["hvm"],
          },
        ]}
      />

      <Resource
        type="aws_security_group"
        name="instance"
        ref={instanceSgRef}
        vpc_id={defaultVpcRef.id}
        description="Security group for web server instances"
        lifecycle={{ create_before_destroy: true }}
      />

      <Resource
        type="aws_vpc_security_group_ingress_rule"
        name="instance_http_from_alb"
        security_group_id={instanceSgRef.id}
        from_port={tf.var("server_port")}
        to_port={tf.var("server_port")}
        ip_protocol="tcp"
        referenced_security_group_id={albSgRef.id}
      />

      <Resource
        type="aws_vpc_security_group_egress_rule"
        name="instance_all_egress"
        security_group_id={instanceSgRef.id}
        ip_protocol="-1"
        cidr_ipv4="0.0.0.0/0"
      />

      <Resource
        type="aws_security_group"
        name="alb"
        ref={albSgRef}
        vpc_id={defaultVpcRef.id}
        description="Security group for public ALB"
      />

      <Resource
        type="aws_vpc_security_group_ingress_rule"
        name="alb_http"
        security_group_id={albSgRef.id}
        from_port={80}
        to_port={80}
        ip_protocol="tcp"
        cidr_ipv4="0.0.0.0/0"
      />

      <Resource
        type="aws_vpc_security_group_egress_rule"
        name="alb_to_instances"
        security_group_id={albSgRef.id}
        from_port={tf.var("server_port")}
        to_port={tf.var("server_port")}
        ip_protocol="tcp"
        referenced_security_group_id={instanceSgRef.id}
      />

      <Resource
        type="aws_launch_template"
        name="example"
        ref={launchTemplateRef}
      >
        {`
          image_id        = ${amiRef.id}
          instance_type   = "t2.micro"
          vpc_security_group_ids = [${instanceSgRef.id}]

          user_data = base64encode(<<-EOF
            #!/bin/bash
            echo "Hello, World" > index.html
            nohup busybox httpd -f -p "\${var.server_port}" &
          EOF
          )

          lifecycle {
            create_before_destroy = true
          }
        `}
      </Resource>

      <Resource
        type="aws_lb_target_group"
        name="example"
        ref={targetGroupRef}
        port={tf.var("server_port")}
        protocol="HTTP"
        vpc_id={defaultVpcRef.id}
        attributes={{ name: "terraform-asg-example" }}
        health_check={{
          path: "/",
          protocol: "HTTP",
          matcher: "200",
          interval: 30,
          timeout: 5,
          healthy_threshold: 2,
          unhealthy_threshold: 2,
        }}
      />

      <Resource
        type="aws_lb"
        name="example"
        ref={albRef}
        internal={false}
        load_balancer_type="application"
        security_groups={[albSgRef.id]}
        subnets={defaultSubnetsRef.ids}
        attributes={{ name: "terraform-asg-example" }}
      />

      <Resource
        type="aws_lb_listener"
        name="http"
        load_balancer_arn={albRef.arn}
        port={80}
        protocol="HTTP"
        default_action={[
          {
            type: "forward",
            target_group_arn: targetGroupRef.arn,
          },
        ]}
      />

      <Resource
        type="aws_autoscaling_group"
        name="example"
        vpc_zone_identifier={defaultSubnetsRef.ids}
        target_group_arns={[targetGroupRef.arn]}
        health_check_type="ELB"
        min_size={2}
        max_size={10}
        launch_template={[
          {
            id: launchTemplateRef.id,
            version: "$Latest",
          },
        ]}
        tag={{
          key: "Name",
          value: "terraform-asg-example",
          propagate_at_launch: true,
        }}
      />

      <Output name="alb_dns_name" value={albRef.dns_name} />
    </>
  );
}

export default <ClusterWebServer />;
