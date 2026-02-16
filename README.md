# react-hcl

A transpiler that converts JSX/TSX into Terraform `.tf` files. Write Terraform configurations using JSX/TSX syntax with a custom JSX runtime (no React dependency).

## Why React for IaC?

This project starts from a readability problem in IaC.
In HCL, reference direction and state flow are hard to constrain at the notation level, so causality tends to spread across the config.
That makes end-to-end reasoning from input to output expensive.
We use React because component boundaries and data flow provide structure for understanding first.
The goal is not to rewrite Terraform in JS, but to structurally improve IaC comprehensibility.

## Usage

Use the CLI to print Terraform to stdout or write it to a file.

```bash
react-hcl infra.tsx                  # output to stdout
react-hcl infra.tsx -o ./tf/main.tf   # write to file
```

## Example

`main.tsx` — A VPC with a web server, using a verified module and a custom component:

```tsx
import { DataSource, Module, Output, Provider, tf, useRef } from "react-hcl";
import { WebServer } from "./web-server";

function Main({ region, instanceType }) {
  const azRef = useRef();
  const vpcRef = useRef();

  return (
    <>
      <Provider type="aws" region={region} />
      <DataSource type="aws_availability_zones" name="available" ref={azRef} />

      <Module
        name="vpc"
        ref={vpcRef}
        source="terraform-aws-modules/vpc/aws"
        cidr="10.0.0.0/16"
        azs={tf.raw(`${azRef.names}`)}
        public_subnets={["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]}
        enable_dns_hostnames={true}
      />

      <WebServer
        vpcId={vpcRef.vpc_id}
        subnetId={tf.raw(`${vpcRef.public_subnets}[0]`)}
        instanceType={instanceType}
      />

      <Output name="vpc_id" value={vpcRef.vpc_id} />
    </>
  );
}

export default <Main region="us-east-1" instanceType="t3.micro" />;
```

`web-server.tsx`

Component implementation for AMI lookup, security group rules, and EC2 instance creation.

```tsx
import { DataSource, Resource, useRef } from "react-hcl";

export function WebServer({ vpcId, subnetId, instanceType }) {
  const amiRef = useRef();
  const sgRef = useRef();

  return (
    <>
      <DataSource
        type="aws_ami"
        name="ubuntu"
        ref={amiRef}
        most_recent={true}
        owners={["099720109477"]}
        filter={[
          { name: "name", values: ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"] },
        ]}
      />
      <Resource
        type="aws_security_group"
        name="web"
        ref={sgRef}
        vpc_id={vpcId}
      />
      <Resource
        type="aws_vpc_security_group_ingress_rule"
        name="web_http"
        security_group_id={sgRef.id}
        from_port={80}
        to_port={80}
        ip_protocol="tcp"
        cidr_ipv4="0.0.0.0/0"
      />
      <Resource
        type="aws_vpc_security_group_egress_rule"
        name="web_all"
        security_group_id={sgRef.id}
        ip_protocol="-1"
        cidr_ipv4="0.0.0.0/0"
      />
      <Resource
        type="aws_instance"
        name="web"
        ami={amiRef.id}
        instance_type={instanceType}
        subnet_id={subnetId}
        vpc_security_group_ids={[sgRef.id]}
      />
    </>
  );
}
```

Run the transpiler for `main.tsx`:

```bash
$ react-hcl main.tsx
```

<details>
<summary>Generated <code>.tf</code> — refs resolve to Terraform references, component boundaries dissolve into a flat file</summary>

Generated Terraform output:

```hcl
provider "aws" {
  region = "us-east-1"
}

data "aws_availability_zones" "available" {
}

module "vpc" {
  source               = "terraform-aws-modules/vpc/aws"
  cidr                 = "10.0.0.0/16"
  azs                  = data.aws_availability_zones.available.names
  public_subnets       = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  enable_dns_hostnames = true
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"]
  }
}

resource "aws_security_group" "web" {
  vpc_id = module.vpc.vpc_id
}

resource "aws_vpc_security_group_ingress_rule" "web_http" {
  security_group_id = aws_security_group.web.id
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_vpc_security_group_egress_rule" "web_all" {
  security_group_id = aws_security_group.web.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.web.id]
}

output "vpc_id" {
  value = module.vpc.vpc_id
}
```

</details>

See [`samples/`](samples/) for more examples including ECS Fargate and S3+CloudFront.

## Components

| Component | HCL block |
|---|---|
| `<Resource>` | `resource "type" "name" { ... }` |
| `<DataSource>` | `data "type" "name" { ... }` |
| `<Variable>` | `variable "name" { ... }` |
| `<Output>` | `output "name" { ... }` |
| `<Locals>` | `locals { ... }` |
| `<Provider>` | `provider "type" { ... }` |
| `<Terraform>` | `terraform { ... }` |

## Hooks & Helpers

- `useRef()` - Create a reference to a resource/data source (`ref.id`, `ref.arn`, etc.)
- `tf.var("name")` - Reference a variable (`var.name`)
- `tf.local("name")` - Reference a local value (`local.name`)
- `tf.raw("...")` - Emit a Terraform expression as-is (no quote wrapping, no `${}` auto-wrapping)
- `tf.block({ ... })` - Force nested block syntax. Arrays of `tf.block(...)` are emitted as repeated blocks.

## Installation

### From npm

Install the published CLI globally from npm.

```bash
npm install -g react-hcl
```

### Manual install from source

Clone, build, and link the CLI from source.

```bash
git clone https://github.com/jugyo/react-hcl.git
cd react-hcl
bun install
bun run build
npm link
```

After this, the `react-hcl` command is available globally.

## Development

Set up a local development environment.

```bash
git clone https://github.com/jugyo/react-hcl.git
cd react-hcl
bun install
```

Run the CLI directly without building.

```bash
bun src/cli.ts infra.tsx
bun src/cli.ts infra.tsx -o ./tf/main.tf
```

Run the test suite.

```bash
bun test
```

Build distributable output.

```bash
bun run build
```

## Documentation

- [Design Document](docs/design-doc.md)
- [Product Requirements](docs/prd.md)
