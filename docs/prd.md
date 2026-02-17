# Product Requirements Document (Minimized): React Terraform

## 1. Product Overview

### 1.1 Purpose
Provide a transpiler that allows writing Terraform configurations using React (JSX/TSX) syntax and converts them into standard `.tf` files.
The final output is a `main.tf` file that can be used directly with Terraform CLI, with a focus on integration into existing workflows.

### 1.2 Concept
- Resolve JS-side conditionals and loops at build time (`.tsx -> .tf`)
- Generate readable HCL so that deployment contents can be understood in advance
- This tool is limited to "conversion" responsibility and does not handle Terraform execution

### 1.3 Scope
**In Scope**
- Transpiling from `.tsx` to `.tf`
- Expressing `Resource` / `DataSource` / `Output` / `Provider` / `Variable` / `Locals` / `Terraform`
- Hybrid usage of JSX attribute syntax and innerText HCL syntax
- Reference expressions via `useRef`
- Development support through TypeScript (initially focused on major resources)

**Out of Scope**
- Terraform execution (`plan` / `apply`)
- Terraform CLI validation commands (`terraform validate`, etc.)
- `tfstate` management
- Terraform provider implementation
- Advanced dependency management/orchestration like Terragrunt

### 1.4 Target Users
- Developers with foundational knowledge of both React and Terraform
- Teams seeking to improve readability, reusability, and reviewability of Terraform configurations

## 2. Product Requirements

### 2.1 Output Requirements
- The final output is a single `main.tf`
- `main.tf` can contain `resource` / `data` / `output` / `provider` / `variable` / `locals` / `terraform` blocks
- Output order preserves the React component tree evaluation order (`.tsx` declaration order)
- Logical grouping via composite components is reflected in `main.tf` layout

### 2.2 Syntax Requirements (Hybrid)
- JSX attribute syntax is recommended for simple cases
- innerText HCL syntax is allowed for complex nesting/dynamic constructs
- When using innerText, specifying attributes other than `type` and `name` is prohibited
- innerText children can be a string (`{\`...\`}`) or a function returning a string (`{() => \`...\`}`)
- When using `useRef` references inside innerText, a function is required for lazy evaluation; plain template literals with refs throw a runtime error with guidance
- The JS expression evaluation scope within innerText follows standard JavaScript rules (lexical scoping)
- `${expr}` within innerText is evaluated as a JS expression; `\${expr}` is output as-is as a Terraform expression (standard JS escaping)
- JSX attribute names use Terraform field names (snake_case) directly

### 2.3 Provider Aliases
- Provider aliases can be defined via the `alias` attribute on `<Provider>`
- `<Resource>` / `<DataSource>` reference them via `useRef` on the `provider` attribute

### 2.4 References & Collision Rules
- `useRef` is supported as a reference expression (resource attribute references, `provider`, `depends_on`)
- What is a reference in HCL is expressed with `useRef`; what is a string in HCL is expressed as a string
- Resource name collision detection follows Terraform compatibility:
  - Same `type + label` between `<Resource>` elements is an error
  - Same `type + name` between `<DataSource>` elements is an error
  - Same `<Resource>(type + label)` and `<DataSource>(type + name)` is allowed
- Duplicate `<Variable>` names are an error

### 2.5 Environment Separation
- Environment differences are handled by separating entry-point `.tsx` files per environment, passing environment-specific values via props or variables
- The intended workflow generates `main.tf` into separate directories per environment

### 2.6 Validation Responsibility
- React Terraform does not execute `terraform validate`
- Validation of generated output is performed by the user in their local environment (can also be done in CI as needed)

## 3. Constraints & Assumptions

### 3.1 Constraints
- Targets Terraform 1.0 and above
- Conversion target is a single entry-point `.tsx` (imports from it are allowed)
- Only `useRef` is supported among React Hooks

### 3.2 Assumptions
- Users understand the basic concepts of React and Terraform
- A Node.js runtime environment is available
- Generated `main.tf` is executed with standard Terraform CLI

## 4. Success Criteria (PoC)

### 4.1 Functional
- Major resource definitions can be converted from `.tsx` to `main.tf`
- References (`useRef`) are correctly converted to HCL references
- Generated output passes `terraform validate`
- Generated output is valid HCL and can be verified with `terraform plan`

### 4.2 Developer Experience
- Evaluated as more maintainable than native Terraform syntax
- Component reuse reduces duplication
- TypeScript completion is practical for real use

### 4.3 Validation Hypotheses
- Does JSX syntax improve readability?
- Is the build-time resolution approach operationally intuitive?
- Does the hybrid syntax (attribute/innerText) work in practice?
- Can differentiation from CDKTF (HCL output, existing Terraform workflow integration) be felt?
