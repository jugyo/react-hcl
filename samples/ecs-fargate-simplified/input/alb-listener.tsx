import { Resource } from "react-terraform";

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
    </>
  );
}
