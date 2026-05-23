---
layout: home

hero:
  name: react-hcl
  text: Write with structure. Review as HCL.
  tagline: Author Terraform configuration in JSX/TSX with component boundaries, then generate normal .tf files for your existing Terraform workflow.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Learn the Concepts
      link: /guide/concepts

features:
  - title: Structure before output
    details: Use components, props, conditionals, and loops to organize infrastructure while authoring.
  - title: HCL remains the artifact
    details: Generate Terraform .tf files that can be read, reviewed, formatted, validated, planned, and applied with Terraform CLI.
  - title: Terraform stays in charge
    details: react-hcl stops at transpilation. State, providers, validation, planning, and apply remain in Terraform.
---

## Why react-hcl?

Terraform HCL is a good deployment format, but large configurations can make relationships hard to follow. Inputs, resources, data sources, modules, and outputs often form a chain of causality that is spread across many blocks.

`react-hcl` adds an authoring layer before HCL. You can group related Terraform blocks into components, pass values through props, and use ordinary TypeScript expressions to build repeated or environment-specific structure.

The generated result is still normal HCL:

```text
JSX/TSX components -> react-hcl generate -> Terraform .tf
```

That means pull requests can review the generated Terraform, and Terraform CLI still owns validation, planning, apply, providers, and state.

## Start Here

- [Getting Started](/guide/getting-started) walks through installation, `init`, generation, and Terraform validation.
- [Concepts](/guide/concepts) explains how components, refs, expressions, and output order work.
- [Terraform Workflow](/guide/terraform-workflow) shows where `react-hcl` fits in a normal Terraform process.
