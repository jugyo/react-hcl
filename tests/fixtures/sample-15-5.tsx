import { Provider, Resource, useRef } from "react-hcl";

function App() {
  const virginiaRef = useRef();
  return (
    <>
      <Provider type="aws" region="ap-northeast-1" />
      <Provider
        type="aws"
        ref={virginiaRef}
        alias="virginia"
        region="us-east-1"
      />
      <Resource
        type="aws_instance"
        label="tokyo"
        ami="ami-xxx"
        instance_type="t3.micro"
      />
      <Resource
        type="aws_instance"
        label="us"
        ami="ami-yyy"
        instance_type="t3.micro"
        provider={virginiaRef}
      />
    </>
  );
}

export default <App />;
