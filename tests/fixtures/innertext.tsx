import { DataSource, Resource } from "react-terraform";

function App() {
  return (
    <>
      <Resource type="aws_instance" name="web">
        {`
          ami           = "ami-0c55b159cbfafe1f0"
          instance_type = "t2.micro"

          tags = {
            Name = "web-server"
          }
        `}
      </Resource>
      <DataSource type="aws_ami" name="latest">
        {`most_recent = true
owners      = ["amazon"]

filter {
  name   = "name"
  values = ["amzn2-ami-hvm-*"]
}`}
      </DataSource>
    </>
  );
}

export default <App />;
