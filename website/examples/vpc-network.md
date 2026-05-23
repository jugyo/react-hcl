# VPC Network

Source: `examples/vpc-network-simplified`

## What This Example Shows

This example creates a VPC with public and private subnets.

It demonstrates:

- TypeScript values instead of Terraform variables for fixed environment shape
- TypeScript loops instead of Terraform `count`
- composite components for public and private network concerns
- refs passed between parent and child components

## Input Structure

```text
examples/vpc-network-simplified/
  input/main.tsx
  input/public-network.tsx
  input/private-network.tsx
  output/main.tf
```

## Key TSX Snippet

```tsx
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

```hcl
resource "aws_subnet" "public_0" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("10.0.0.0/16", 8, 0)
  availability_zone       = data.aws_availability_zones.available.names[0]
  map_public_ip_on_launch = true
}

resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet("10.0.0.0/16", 8, 1)
  availability_zone       = data.aws_availability_zones.available.names[1]
  map_public_ip_on_launch = true
}

output "public_subnet_ids" {
  value = [aws_subnet.public_0.id, aws_subnet.public_1.id]
}
```

## Notes

The loop runs before HCL generation. Terraform receives concrete subnet blocks, not a JavaScript loop.

Use this style when the number of generated blocks is part of the source configuration shape.
