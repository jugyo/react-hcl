import { Resource } from "react-hcl";

export function Alb({
  vpcRef,
  lbSgRef,
  albRef,
  publicSubnetRefs,
}: {
  vpcRef: any;
  lbSgRef: any;
  albRef: any;
  publicSubnetRefs: any[];
}) {
  return (
    <>
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

      <Resource type="aws_alb" name="main" ref={albRef}>
        {`
          name            = "tf-ecs-chat"
          subnets         = [${publicSubnetRefs.map((r) => r.id).join(", ")}]
          security_groups = [${lbSgRef.id}]
        `}
      </Resource>
    </>
  );
}
