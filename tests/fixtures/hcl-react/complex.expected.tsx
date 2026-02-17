<Locals
  app_name="demo"
  dynamic={tf.raw("upper(var.env)")}
/>
<Module
  label="network"
  ingress={[tf.block({ from_port: 80 }), tf.block({ from_port: 443 })]}
  source="./modules/network"
  __hcl={{ "user-data": "#!/bin/bash" }}
/>
<Provider
  type="aws"
  region="us-east-1"
/>
<Variable
  label="env"
  default="dev"
  type="string"
/>
