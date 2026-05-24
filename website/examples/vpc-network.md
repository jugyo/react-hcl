# VPC Network

## What This Example Shows

This example creates a VPC with public and private subnets.

It demonstrates:

- TypeScript values instead of Terraform variables for fixed environment shape
- TypeScript loops instead of Terraform `count`
- composite components for public and private network concerns
- refs passed between parent and child components

## Key TSX Snippet

```tsx
const vpcCidr = "10.0.0.0/16";
const publicSubnetCount = 2;
const privateSubnetCount = 2;
const projectName = "demo";

const azRef = useRef();
const vpcRef = useRef();
const igwRef = useRef();
const natSubnetRef = useRef();

<Data type="aws_availability_zones" label="available" ref={azRef} />
<Resource type="aws_vpc" label="main" ref={vpcRef} cidr_block={vpcCidr} />

<Resource
  type="aws_subnet"
  label="public_0"
  ref={natSubnetRef}
  vpc_id={vpcRef.id}
  cidr_block={tf.raw(`cidrsubnet("${vpcCidr}", 8, 0)`)}
  availability_zone={tf.raw(`${azRef.names}[0]`)}
  map_public_ip_on_launch={true}
  tags={{ Name: `${projectName}-public-0` }}
/>

<PublicNetwork
  vpcRef={vpcRef}
  azRef={azRef}
  igwRef={igwRef}
  natSubnetRef={natSubnetRef}
  vpcCidr={vpcCidr}
  subnetCount={publicSubnetCount}
  projectName={projectName}
/>

<PrivateNetwork
  vpcRef={vpcRef}
  azRef={azRef}
  igwRef={igwRef}
  natSubnetRef={natSubnetRef}
  vpcCidr={vpcCidr}
  subnetCount={privateSubnetCount}
  projectName={projectName}
/>
```

## TypeScript Loop Snippet

```tsx
const subnetRefs = Array.from({ length: subnetCount - 1 }, () => useRef());

{subnetRefs.map((ref, i) => (
  <Resource
    type="aws_subnet"
    label={`public_${i + 1}`}
    ref={ref}
    vpc_id={vpcRef.id}
    cidr_block={tf.raw(`cidrsubnet("${vpcCidr}", 8, ${i + 1})`)}
    availability_zone={tf.raw(`${azRef.names}[${i + 1}]`)}
    map_public_ip_on_launch={true}
    tags={{ Name: `${projectName}-public-${i + 1}` }}
  />
))}
```

## Generated HCL Snippet

The loop emits concrete subnet blocks such as `public_1`:

```hcl
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("10.0.0.0/16", 8, 1)
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true

  tags = {
    Name = "demo-public-1"
  }
}
```

## Takeaway

The loop runs before HCL generation. Terraform receives concrete subnet blocks, not a JavaScript loop.

Use this style when the number of generated blocks is part of the source configuration shape.
