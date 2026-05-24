---
layout: home

hero:
  name: react-hcl
  text: Render Terraform HCL from TSX.
  tagline: A TSX authoring layer for rendering Terraform configuration.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Learn the Concepts
      link: /guide/concepts

features:
  - title: Rendering before output
    details: Use TSX to describe how Terraform configuration is produced from shared inputs and patterns.
  - title: HCL remains the artifact
    details: Generate Terraform .tf files that can be read, reviewed, formatted, validated, planned, and applied with Terraform CLI.
  - title: Terraform stays in charge
    details: react-hcl stops at transpilation. State, providers, validation, planning, and apply remain in Terraform.
---

## Why react-hcl?

CDK-style tools often model infrastructure through imperative construction APIs. `react-hcl` treats Terraform configuration as a render target instead.

For example, this TSX:

```tsx
import { Resource } from "react-hcl";

export default (
  <Resource
    type="aws_s3_bucket"
    label="assets"
    bucket="my-assets"
  />
);
```

Generates this HCL:

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "my-assets"
}
```

## Start Here

- [Getting Started](/guide/getting-started) walks through installation, `init`, generation, and Terraform validation.
- [Concepts](/guide/concepts) explains how components, refs, expressions, and output order work.
