import { Variable, Locals, Resource, tf } from "react-terraform";

export default (
  <>
    <Variable name="environment" type="string" default="dev" />
    <Locals common_tags={{ Environment: tf.var("environment") }} />
    <Resource type="aws_instance" name="web" ami="ami-xxx" instance_type="t3.micro" tags={tf.local("common_tags")} />
  </>
);
