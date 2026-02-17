import { Data, Resource } from "react-hcl";

function App() {
  return (
    <>
      <Resource type="aws_instance" label="web">
        {`
          ami           = "ami-0c55b159cbfafe1f0"
          instance_type = "t2.micro"

          tags = {
            Name = "web-server"
          }
        `}
      </Resource>
      <Data type="aws_ami" label="latest">
        {`most_recent = true
owners      = ["amazon"]

filter {
  name   = "name"
  values = ["amzn2-ami-hvm-*"]
}`}
      </Data>
    </>
  );
}

export default <App />;
