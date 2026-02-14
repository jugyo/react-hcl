/**
 * Intermediate representation (IR) types for HCL blocks.
 *
 * These types serve as the bridge between JSX component evaluation and HCL code generation.
 * The JSX components (Resource, Data, Variable, etc.) produce Block objects,
 * and the generator (generator.ts) consumes them to emit valid HCL/Terraform source code.
 *
 * Each block type corresponds to a top-level Terraform construct and carries:
 *   - `blockType`: discriminant tag for the union type (used in switch/case dispatch)
 *   - `attributes`: key-value pairs serialized into the block body via serializeHCLAttributes()
 *   - `innerText` (optional): pre-formatted HCL string that replaces attribute serialization.
 *     When present, the generator outputs innerText as-is instead of serializing attributes.
 *     This is used for cases where children provide raw HCL content.
 *     With 2-pass rendering, template literals in children are resolved automatically.
 *
 * Supported HCL output forms:
 *   resource "type" "name" { ... }   — ResourceBlock
 *   data "type" "name" { ... }       — DataSourceBlock
 *   variable "name" { ... }          — VariableBlock
 *   output "name" { ... }            — OutputBlock
 *   locals { ... }                   — LocalsBlock (no name label)
 *   provider "type" { ... }          — ProviderBlock
 *   terraform { ... }                — TerraformBlock (no name label)
 */

/**
 * Represents a Terraform resource block.
 * Output: resource "<type>" "<name>" { <attributes> }
 *
 * Example:
 *   { blockType: "resource", type: "aws_vpc", name: "main", attributes: { cidr_block: "10.0.0.0/16" } }
 *   → resource "aws_vpc" "main" { cidr_block = "10.0.0.0/16" }
 */
export type ResourceBlock = {
  blockType: "resource";
  type: string; // Terraform resource type, e.g. "aws_vpc", "aws_s3_bucket"
  name: string; // Logical name within the Terraform config, e.g. "main", "primary"
  attributes: Record<string, any>;
  innerText?: string; // If set, raw HCL body used instead of serializing attributes
};

/**
 * Represents a Terraform data source block.
 * Output: data "<type>" "<name>" { <attributes> }
 *
 * Example:
 *   { blockType: "data", type: "aws_ami", name: "latest", attributes: { most_recent: true } }
 *   → data "aws_ami" "latest" { most_recent = true }
 */
export type DataSourceBlock = {
  blockType: "data";
  type: string; // Data source type, e.g. "aws_ami", "aws_availability_zones"
  name: string; // Logical name, e.g. "latest", "available"
  attributes: Record<string, any>;
  innerText?: string;
};

/**
 * Represents a Terraform variable block.
 * Output: variable "<name>" { <attributes> }
 * Attributes typically include: type, default, description, validation, sensitive, nullable
 */
export type VariableBlock = {
  blockType: "variable";
  name: string; // Variable name, e.g. "environment", "instance_type"
  attributes: Record<string, any>;
};

/**
 * Represents a Terraform output block.
 * Output: output "<name>" { <attributes> }
 * Attributes typically include: value, description, sensitive
 */
export type OutputBlock = {
  blockType: "output";
  name: string; // Output name, e.g. "vpc_id", "public_ip"
  attributes: Record<string, any>;
};

/**
 * Represents a Terraform locals block.
 * Output: locals { <attributes> }
 * Unlike most blocks, locals has no name label — there is only one locals block per scope.
 */
export type LocalsBlock = {
  blockType: "locals";
  attributes: Record<string, any>;
};

/**
 * Represents a Terraform provider block.
 * Output: provider "<type>" { <attributes> }
 * Attributes typically include: region, access_key, alias, etc.
 */
export type ProviderBlock = {
  blockType: "provider";
  type: string; // Provider name, e.g. "aws", "google", "azurerm"
  attributes: Record<string, any>;
};

/**
 * Represents the top-level terraform {} configuration block.
 * Output: terraform { <attributes> }
 * Typically contains: required_version, required_providers, backend config.
 * Uses innerText for nested blocks like `backend "s3" { ... }` that need raw HCL.
 */
export type TerraformBlock = {
  blockType: "terraform";
  attributes: Record<string, any>;
  innerText?: string;
};

/**
 * Union type of all supported HCL block types.
 * Used as the input to the generate() function in generator.ts.
 * The `blockType` field acts as a discriminated union tag.
 */
export type Block =
  | ResourceBlock
  | DataSourceBlock
  | VariableBlock
  | OutputBlock
  | LocalsBlock
  | ProviderBlock
  | TerraformBlock;
