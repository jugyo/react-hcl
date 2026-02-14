import { Variable, Locals, tf } from "react-terraform";

export default (
  <>
    <Variable name="environment" type="string" default="dev" />
    <Locals
      common_tags={{ Environment: tf.var("environment") }}
    />
  </>
);
