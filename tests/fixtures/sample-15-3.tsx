import { Locals, tf, Variable } from "react-hcl";

export default (
  <>
    <Variable label="environment" type="string" default="dev" />
    <Locals common_tags={{ Environment: tf.var("environment") }} />
  </>
);
