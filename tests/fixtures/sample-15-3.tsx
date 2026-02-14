import { Locals, tf, Variable } from "react-terraform";

export default (
  <>
    <Variable name="environment" type="string" default="dev" />
    <Locals common_tags={{ Environment: tf.var("environment") }} />
  </>
);
