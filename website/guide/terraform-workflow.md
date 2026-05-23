# Terraform Workflow

`react-hcl` is designed to fit into a normal Terraform workflow.

It generates `.tf` files. Terraform CLI still validates, plans, applies, and manages state.

## Basic Flow

```text
author TSX
  -> react-hcl generate
  -> review generated .tf
  -> terraform fmt / validate / plan / apply
```

Example:

```bash
react-hcl generate src/main.tsx -o terraform/main.tf
cd terraform
terraform fmt
terraform init
terraform validate
terraform plan
```

## Generated Files

Generated `.tf` files are normal Terraform files.

Teams can choose either workflow:

- commit generated `.tf` files so pull requests show exactly what Terraform will see
- generate `.tf` files in CI and publish or validate them there

For early adoption, committing generated HCL is often useful because it makes the transpilation result visible during review.

## Pull Request Review

A useful pull request can show both:

- TSX source changes
- generated HCL changes

The TSX shows the intent and structure. The HCL shows the concrete Terraform configuration that will be validated and planned.

## Validation

`react-hcl` does not run Terraform validation.

Use Terraform CLI:

```bash
terraform fmt
terraform validate
terraform plan
```

This keeps provider-specific validation, backend configuration, and runtime behavior in Terraform.

## Secrets and Runtime Values

Do not embed secrets at TSX evaluation time.

Prefer Terraform runtime inputs:

```tsx
<Variable label="db_password" type="string" sensitive={true} />
```

Then reference them with Terraform expressions:

```tsx
password={tf.var("db_password")}
```

For values that should come from cloud services or secret stores, use Terraform data sources as you would in plain HCL.

## Environment Separation

Use separate TSX entrypoints, props, or Terraform variables for environment differences.

For example:

```tsx
export default <Main environment="prod" region="ap-northeast-1" />;
```

```bash
react-hcl generate src/prod.tsx -o envs/prod/main.tf
react-hcl generate src/staging.tsx -o envs/staging/main.tf
```

The generated HCL should be concrete for each environment. Environment-specific runtime values can still be passed through Terraform variables.

## CI Pattern

A typical CI flow can run:

```bash
react-hcl generate src/main.tsx -o terraform/main.tf
terraform -chdir=terraform fmt -check
terraform -chdir=terraform init
terraform -chdir=terraform validate
terraform -chdir=terraform plan
```

If provider credentials are not available in every CI context, split validation and planning into separate jobs.

## Responsibility Split

`react-hcl`:

- evaluates TSX
- expands components
- resolves refs
- writes HCL

Terraform:

- loads providers
- validates provider schemas
- plans changes
- applies changes
- manages state
