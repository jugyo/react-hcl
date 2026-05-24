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
  - title: Author in TSX, render HCL
    details: Use components, props, conditionals, and loops to describe configuration, then generate plain Terraform .tf files.
  - title: Components compile away
    details: Custom components run during generation. The output contains primitive Terraform blocks, not a new runtime abstraction.
  - title: Keep Terraform semantics
    details: Refs and tf helpers emit Terraform references and expressions while Terraform CLI still handles validation, planning, state, and apply.
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
