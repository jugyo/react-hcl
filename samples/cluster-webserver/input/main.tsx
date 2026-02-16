/**
 * Cluster Web Server on AWS
 *
 * Auto Scaling Group + ELB + Security Groups.
 * Based on: https://github.com/alfonsof/terraform-aws-examples/tree/master/code/05-cluster-webserver
 */
import {
  Data,
  Output,
  Provider,
  Resource,
  Terraform,
  tf,
  useRef,
  Variable,
} from "react-hcl";

function ClusterWebServer() {
  const azRef = useRef();
  const instanceSgRef = useRef();
  const elbSgRef = useRef();
  const launchConfigRef = useRef();
  const elbRef = useRef();

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
      <Provider type="aws" region="eu-west-1" />

      <Variable
        name="server_port"
        description="The port the server will use for HTTP requests"
        default="8080"
      />

      <Data type="aws_availability_zones" name="all" ref={azRef} />

      <Resource
        type="aws_security_group"
        name="instance"
        ref={instanceSgRef}
        ingress={[
          {
            from_port: tf.var("server_port"),
            to_port: tf.var("server_port"),
            protocol: "tcp",
            cidr_blocks: ["0.0.0.0/0"],
          },
        ]}
        lifecycle={{ create_before_destroy: true }}
      />

      <Resource
        type="aws_security_group"
        name="elb"
        ref={elbSgRef}
        ingress={[
          {
            from_port: 80,
            to_port: 80,
            protocol: "tcp",
            cidr_blocks: ["0.0.0.0/0"],
          },
        ]}
        egress={[
          {
            from_port: 0,
            to_port: 0,
            protocol: "-1",
            cidr_blocks: ["0.0.0.0/0"],
          },
        ]}
      />

      <Resource
        type="aws_launch_configuration"
        name="example"
        ref={launchConfigRef}
      >
        {`
          image_id        = "ami-785db401"
          instance_type   = "t2.micro"
          security_groups = [${instanceSgRef.id}]

          user_data = <<-EOF
            #!/bin/bash
            echo "Hello, World" > index.html
            nohup busybox httpd -f -p "\${var.server_port}" &
          EOF

          lifecycle {
            create_before_destroy = true
          }
        `}
      </Resource>

      <Resource
        type="aws_autoscaling_group"
        name="example"
        launch_configuration={launchConfigRef.id}
        availability_zones={azRef.names}
        load_balancers={[elbRef.name]}
        health_check_type="ELB"
        min_size={2}
        max_size={10}
        tag={[
          {
            key: "Name",
            value: "terraform-asg-example",
            propagate_at_launch: true,
          },
        ]}
      />

      <Resource type="aws_elb" name="example" ref={elbRef}>
        {`
          name               = "terraform-asg-example"
          availability_zones = ${azRef.names}
          security_groups    = [${elbSgRef.id}]

          listener {
            lb_port           = 80
            lb_protocol       = "http"
            instance_port     = ${tf.var("server_port")}
            instance_protocol = "http"
          }

          health_check {
            healthy_threshold   = 2
            unhealthy_threshold = 2
            timeout             = 3
            interval            = 30
            target              = "HTTP:\${var.server_port}/"
          }
        `}
      </Resource>

      <Output name="elb_dns_name" value={elbRef.dns_name} />
    </>
  );
}

export default <ClusterWebServer />;
