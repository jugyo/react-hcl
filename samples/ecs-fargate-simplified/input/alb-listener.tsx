import { Resource } from "react-hcl";

export function AlbListener({
  albRef,
  vpcRef,
  tgRef,
  listenerRef,
}: {
  albRef: any;
  vpcRef: any;
  tgRef: any;
  listenerRef: any;
}) {
  return (
    <>
      <Resource type="aws_lb_target_group" name="app" ref={tgRef}>
        {`
          name        = "tf-ecs-chat"
          port        = 80
          protocol    = "HTTP"
          vpc_id      = ${vpcRef.id}
          target_type = "ip"
        `}
      </Resource>

      <Resource type="aws_lb_listener" name="front_end" ref={listenerRef}>
        {`
          load_balancer_arn = ${albRef.arn}
          port              = "80"
          protocol          = "HTTP"

          default_action {
            target_group_arn = ${tgRef.arn}
            type             = "forward"
          }
        `}
      </Resource>
    </>
  );
}
