import { Module, useRef } from "react-hcl";

export default function App() {
  const network = useRef();
  const database = useRef();

  return (
    <>
      <Module
        ref={network}
        name="networking"
        source="./modules/networking"
        vpc_cidr="10.0.0.0/16"
      />

      <Module
        ref={database}
        name="database"
        source="./modules/rds"
        vpc_id={network.vpc_id}
        depends_on={[network]}
      />

      <Module
        name="application"
        source="./modules/ecs"
        vpc_id={network.vpc_id}
        database_endpoint={database.endpoint}
        depends_on={[network, database]}
      />
    </>
  );
}
