import { Locals, tf, Variable } from "react-hcl";

export default (
  <>
    <Variable name="environment" type="string" default="dev" />
    <Locals common_tags={{ Environment: tf.var("environment") }} />
  </>
);
