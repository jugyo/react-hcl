import { Locals, Resource, tf, Variable } from "react-hcl";

export default (
  <>
    <Variable label="environment" type="string" default="dev" />
    <Locals common_tags={{ Environment: tf.var("environment") }} />
    <Resource
      type="aws_instance"
      label="web"
      ami="ami-xxx"
      instance_type="t3.micro"
      tags={tf.local("common_tags")}
    />
  </>
);
