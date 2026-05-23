# Examples

These examples show how TSX source maps to generated Terraform HCL.

Each page highlights the parts that matter for learning `react-hcl`: component composition, refs, expression helpers, direct HCL body text, and generated output.

## Example List

| Example | Shows | Source |
| --- | --- | --- |
| [Module Composition](/examples/module-composition) | Module refs, module outputs, and `depends_on`. | `examples/module-composition` |
| [Static Website](/examples/static-website) | S3, CloudFront, variables, refs, helpers, and HCL body text. | `examples/static-website` |
| [ECS Fargate](/examples/ecs-fargate) | Composite components for network, ALB, listener, and ECS service concerns. | `examples/ecs-fargate-simplified` |
| [VPC Network](/examples/vpc-network) | TypeScript loops and composite network components. | `examples/vpc-network-simplified` |

## How to Read These Examples

Start with the TSX snippets to understand the authoring structure.

Then compare the generated HCL snippets to see what Terraform receives. Custom components disappear from the output; their primitive Terraform blocks remain.

## Run Locally

From the repository root, examples are checked by the test suite and can be type-checked with:

```bash
bun run typecheck:examples
```
