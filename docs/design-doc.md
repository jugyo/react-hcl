# Design Document: React Terraform

## 1. Design Principles
- Final output is a single `main.tf`
- Output order preserves React component tree evaluation order (declaration order)
- Hybrid of JSX attribute syntax and innerText HCL syntax
- Terraform compatibility first (allow same `type + name` between `Resource` and `DataSource`)
- Tool responsibility ends at transpilation; running `terraform validate` is the user's responsibility

## 2. Scope and Non-Scope

### 2.1 Scope
- Transpiling from `.tsx` to `.tf`
- `Resource` / `DataSource` / `Output` / `Provider` / `Variable` / `Locals` / `Terraform`
- Reference expressions via `useRef`
- Build-time JS evaluation (conditionals and loops)

### 2.2 Non-Scope
- Terraform execution (plan/apply)
- Terraform CLI validation (validate/fmt/init)
- tfstate management
- Provider implementation

## 3. Component Model

### 3.1 Primitives
- `<Resource>` -> `resource`
- `<DataSource>` -> `data`
- `<Output>` -> `output`
- `<Provider>` -> `provider`
- `<Variable>` -> `variable`
- `<Locals>` -> `locals`
- `<Terraform>` -> `terraform`

### 3.2 Composites
- Custom components serve as structural units
- Not directly output; internal primitive expansion results are output
- Logical grouping is reflected in `main.tf` placement order
- Props work the same as standard React components (enabling parameterized reuse)
- To expose an internal resource's ref to a parent, accept the ref as a prop (`forwardRef` is not used)

### 3.3 Hooks Constraints
- Supported: `useRef` only
- Not supported: `useState`, `useEffect`, `useMemo`, `useCallback`, etc.

## 4. Syntax Specification

### 4.1 JSX Attribute Syntax
- Standard base syntax
- Easy to leverage type completion and type checking

### 4.2 innerText HCL Syntax
- Used for complex nested blocks, `dynamic`, and migrating existing HCL
- Attributes other than `type` and `name` are prohibited (enforced by TypeScript type definitions)
- JS template expressions are evaluated, then output as HCL
- Children can be a string or a function returning a string (`() => string`)
- When using `useRef` references inside innerText, a function is required (`{() => \`...\${ref.id}...\`}`) to ensure lazy evaluation
- If a ref is used in a plain template literal (without function wrapping), a runtime error is thrown with guidance to use a function

### 4.3 JS Expression Evaluation Scope
- Follows standard JavaScript lexical scoping rules
- Can reference props / local variables / `useRef` / module scope
- No additional custom restrictions

### 4.4 `tf` Helper
- Helper for expressing Terraform expressions (variables and local values) within JSX attributes, which `useRef` cannot cover
- `tf.var("name")` → output as `var.name`
- `tf.local("name")` → output as `local.name`

### 4.5 Escaping
- `${expr}`: JS expression evaluation
- `\${expr}`: Preserve as Terraform expression (output as `${expr}`). Standard JS template literal escaping

## 5. Reference Resolution and Conflict Rules

### 5.1 `useRef` Resolution
- Convert `ref.id` etc. to Terraform references
- Unresolved references result in a build error
- `useRef` is treated as syntax sugar for resource references
- `ref.<attr>` is converted to the target block's attribute reference (e.g., `vpcRef.id` -> `aws_vpc.main.id`)
- `terraform_remote_state` supports `ref.outputs.<name>` references
- Anything that is a reference in HCL is expressed with `useRef` (output as references, not strings)
  - `provider` attribute: reference a `<Provider>` via `useRef` → output as `provider = aws.virginia`
  - `depends_on` attribute: reference via array of `useRef` → output as `depends_on = [aws_vpc.main]`

### 5.2 Conflict Detection
- Same `type + name` between `<Resource>` components is an error
- Same `type + name` between `<DataSource>` components is an error
- Same `type + name` between `<Resource>` and `<DataSource>` is allowed
- Duplicate `<Variable>` names are an error
- Multiple `<Locals>` are each output as independent `locals {}` blocks
- Duplicate `<Output>` names are an error
- Same `type` for `<Provider>` is allowed (to support Terraform alias usage). However, same `type` with same `alias` is an error
- Multiple `<Terraform>` definitions are an error (to maintain a single configuration entry point)

## 6. Output Specification

### 6.1 File
- Generate a single `main.tf` in the output directory

### 6.2 Output Order
- Preserve React-side declaration order (no automatic sorting)
- Maintain composite grouping

### 6.3 innerText and Duplicate Checking
- When innerText is used, attributes other than `type`/`name` are prohibited, so "attribute vs innerText" duplicate checking within the same resource is unnecessary
- However, name conflict detection is still performed as usual

### 6.4 Formatting
- Indentation is automatically adjusted based on minimum indent level
- No formatter is provided (output formatting is handled by the transpiler)

## 7. Transpilation Flow

### 7.1 JSX Attribute Syntax Flow
1. Read TSX
2. Parse JSX/TSX
3. Evaluate component tree (includes `ref` registration and reference resolution; since evaluation follows declaration order, the reference target must be defined before the reference source)
4. Convert attributes to HCL
5. Output `main.tf`

### 7.2 innerText Syntax Flow
1. Read TSX
2. Parse JSX/TSX
3. During rendering, if children is a function, call it (lazy evaluation ensures refs are resolved)
4. Evaluate `${}` within innerText
5. Incorporate evaluated strings as HCL
6. Output `main.tf`

### 7.3 Hybrid
- Attribute syntax and innerText syntax can coexist in the same project

### 7.4 TSX Evaluation Execution Model
- Distributed as an npm package and provided as a CLI tool
- `.tsx` is transpiled then evaluated
- Module format supports ESM only
- `process.env` is available as-is in the execution context
- Side effects are allowed within normal JavaScript execution scope (user responsibility)
- No platform restrictions (usable in any environment where Node.js runs)

## 8. HCL Generation and Validation

### 8.1 HCL Generation
- Attribute syntax: Custom serialization to HCL strings
- innerText: Incorporate expanded text

### 8.2 Minimal Validation
- innerText is syntax-checked with `hcl2-parser` (npm package)
- Post-JS-evaluation HCL text is parsed with `hcl2-parser`'s `parseToObject()`
- Detailed attribute validity is delegated to Terraform CLI (`terraform validate`)

### 8.3 Responsibility Boundary
- React Terraform does not run `terraform validate`
- Users validate locally (and optionally in CI)

## 9. Type Strategy

### 9.1 Phase 1
- Support major resources with manually curated types

### 9.2 Unsupported Types
- Can be used without types (use innerText when needed)

### 9.3 Type and Validation Policy
- Types are for development support (completion and typo detection), not output gates
- Attributes not in type definitions are not errored; they are output as-is to HCL
- Attribute validity checking is delegated to `terraform validate`
- Component props types include index signatures (`[key: string]: any`) to allow unknown attributes

### 9.4 Phase 2 and Beyond
- Consider auto-generating types from provider schemas

## 10. Environment-Specific Build Strategy
- Evaluate environment variables (e.g., `ENV=prod`) in `.tsx`
- Generate `main.tf` to different output directories per environment
- No conditional logic remains in generated output

## 11. Additional Specifications

### 11.1 lifecycle
- `lifecycle` attribute can output `prevent_destroy`, `ignore_changes`, etc.

### 11.2 depends_on
- `depends_on` attribute can explicitly declare dependencies

### 11.3 Provider Aliases
- Define multiple configurations for the same provider using the `alias` attribute on `<Provider>`
- Reference from `<Resource>` / `<DataSource>` via `useRef` in the `provider` attribute
- A `<Provider>` without `alias` serves as the default, used when `provider` is omitted on resources

### 11.4 Terraform Block
- `<Terraform>` supports both innerText and attribute syntax
- Can describe `required_version`, `required_providers`, `backend`

### 11.5 Remote State
- Supports `<DataSource type="terraform_remote_state">`

### 11.6 Provisioner
- Deprecated but supported via attribute syntax

## 12. Error Handling

### 12.1 Policy
- JSX/TSX syntax errors are raised at runtime evaluation (same as standard React)
- Unknown attributes are not validated; they are output as-is to HCL
- Transpiler-specific validation is kept minimal (conflict detection, etc.)

### 12.2 Error Types
- Type errors: Invalid attribute usage with innerText, etc. (detected by TypeScript type checking)
- Syntax errors: Errors during TSX evaluation
- HCL parse errors: Display location and cause within innerText
- JS expression evaluation errors: Display expression and exception message
- Conflict errors: Display block type and `type + name`
- Variable mismatch: Display diff content

## 13. Operations Guide
- Git management of generated `main.tf` is recommended
- Do not embed secret values at build time
- Use `tf.var("...")` and runtime injection as the standard approach
- Use Secrets Manager/Vault data sources as needed

## 14. Test Strategy

### 14.1 Unit Tests
- Attribute -> HCL conversion
- innerText expansion/validation
- `useRef` resolution
- Conflict detection and Variable handling

### 14.2 Integration Tests
- `.tsx -> main.tf` snapshots
- Rebuild consistency for identical input (determinism)

### 14.3 Manual Verification
- Users run `terraform validate`
- Apply verification in real environments as needed

## 15. Sample Code (Migrated from Original PRD)

### 15.1 Basic Resource
```tsx
<Resource
  type="aws_vpc"
  name="main"
  cidr_block="10.0.0.0/16"
  enable_dns_hostnames={true}
/>
```

### 15.2 References (useRef)
```tsx
const vpcRef = useRef();

<>
  <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
  <Resource type="aws_subnet" name="public" vpc_id={vpcRef.id} cidr_block="10.0.1.0/24" />
</>
```

### 15.3 Variable / Locals
```tsx
<>
  <Variable name="environment" type="string" default="dev" />
  <Locals
    common_tags={{ Environment: tf.var("environment") }}
  />
</>
```

### 15.4 innerText
```tsx
<Resource type="aws_security_group" name="example">
  {() => `
    name   = "example"
    vpc_id = ${vpcRef.id}

    dynamic "ingress" {
      for_each = var.additional_ports
      content {
        from_port   = ingress.value
        to_port     = ingress.value
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    }
  `}
</Resource>
```

> **Note**: When using `useRef` references inside innerText, wrap in a function (`{() => \`...\`}`) for lazy evaluation. Plain strings without refs can be passed directly (`{\`...\`}`).


### 15.5 Provider Aliases
```tsx
const virginiaRef = useRef();

<>
  <Provider type="aws" region="ap-northeast-1" />
  <Provider type="aws" ref={virginiaRef} alias="virginia" region="us-east-1" />

  {/* provider omitted → default aws (Tokyo) */}
  <Resource type="aws_instance" name="tokyo" ami="ami-xxx" instance_type="t3.micro" />

  {/* reference provider via useRef → Virginia */}
  <Resource type="aws_instance" name="us" ami="ami-yyy" instance_type="t3.micro" provider={virginiaRef} />
</>
```

### 15.6 depends_on
```tsx
const vpcRef = useRef();

<>
  <Resource type="aws_vpc" name="main" ref={vpcRef} cidr_block="10.0.0.0/16" />
  <Resource type="aws_instance" name="web" ami="ami-xxx" instance_type="t3.micro" depends_on={[vpcRef]} />
</>
```

### 15.7 Terraform Block (Attribute Syntax)
```tsx
<Terraform
  required_version=">= 1.0"
  required_providers={{
    aws: {
      source: "hashicorp/aws",
      version: "~> 5.0",
    },
  }}
/>
```

### 15.8 Terraform Block (innerText Syntax)
```tsx
<Terraform>
  {`
    required_version = ">= 1.0"

    required_providers {
      aws = {
        source  = "hashicorp/aws"
        version = "~> 5.0"
      }
    }

    backend "s3" {
      bucket = "my-terraform-state"
      key    = "prod/terraform.tfstate"
      region = "ap-northeast-1"
    }
  `}
</Terraform>
```

## 16. Future Extensions (Beyond PoC)
- Introduction of `<Module>`
- Auto-generation of type definitions
- `.tf -> .tsx` reverse conversion
- IDE support (innerText HCL completion, diagnostics)
