# Getting Started

This guide takes you from an empty project to a generated Terraform file.

## Install

Install the published CLI from npm:

```bash
npm install -g react-hcl
```

## Initialize Provider Types

Run `init` in the project where you want to author Terraform in TSX:

```bash
react-hcl init
```

`init` fetches Terraform provider schema information, generates local declaration files under `.react-hcl/`, and creates a local `tsconfig.json` when one is missing.
The `.react-hcl/` directory is local support data for authoring and generation; it is separate from the Terraform HCL files you generate and review.

Use `--refresh` when you want to ignore the schema cache and fetch again:

```bash
react-hcl init --refresh
```

## Create `main.tsx`

Create a small Terraform configuration in TSX:

```tsx
import { Output, Provider, Resource, useRef } from "react-hcl";

function Main() {
  const bucketRef = useRef();

  return (
    <>
      <Provider type="aws" region="us-east-1" />
      <Resource
        type="aws_s3_bucket"
        label="assets"
        ref={bucketRef}
        bucket="my-react-hcl-assets"
      />
      <Output label="bucket_id" value={bucketRef.id} />
    </>
  );
}

export default <Main />;
```

## Generate HCL

Generate Terraform HCL from the TSX entrypoint:

```bash
react-hcl generate main.tsx -o main.tf
```

The output is a normal Terraform file:

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "assets" {
  bucket = "my-react-hcl-assets"
}

output "bucket_id" {
  value = aws_s3_bucket.assets.id
}
```

## Validate with Terraform

Use Terraform CLI for validation:

```bash
terraform init
terraform validate
```

## Read Next

- [CLI Reference](/reference/cli)
- [Component Reference](/reference/components)
- [useRef Hook](/reference/hooks)
- [Terraform Helpers](/reference/helpers)
