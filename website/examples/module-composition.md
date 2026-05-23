# Module Composition

Source: `examples/module-composition`

## What This Example Shows

This example demonstrates module composition with:

- refs attached to `<Module>` blocks
- module output references such as `network.vpc_id`
- `depends_on` using a module ref
- outputs that expose module values

## Input Structure

```text
examples/module-composition/
  input/main.tsx
  output/main.tf
```

## Key TSX Snippet

```tsx
const network = useRef();
const database = useRef();

<Module
  ref={network}
  label="networking"
  source="./modules/networking"
  vpc_cidr="10.0.0.0/16"
  environment="production"
/>

<Module
  ref={database}
  label="database"
  source="./modules/rds"
  vpc_id={network.vpc_id}
  subnet_ids={network.private_subnet_ids}
  depends_on={[network]}
/>

<Output label="vpc_id" value={network.vpc_id} />
<Output label="database_endpoint" value={database.endpoint} />
```

## Generated HCL Snippet

```hcl
module "networking" {
  source      = "./modules/networking"
  vpc_cidr    = "10.0.0.0/16"
  environment = "production"
}

module "database" {
  source     = "./modules/rds"
  vpc_id     = module.networking.vpc_id
  subnet_ids = module.networking.private_subnet_ids
  depends_on = [module.networking]
}

output "database_endpoint" {
  value = module.database.endpoint
}
```

## Notes

The TSX source keeps the relationship between modules explicit. The generated HCL uses normal Terraform module references.

Use this pattern when one module consumes outputs from another module and you want the dependency to be visible in the source.
