// Intermediate representation for HCL blocks

export type ResourceBlock = {
  blockType: "resource";
  type: string; // e.g. "aws_vpc"
  name: string; // e.g. "main"
  attributes: Record<string, any>;
  innerText?: string;
};

export type DataSourceBlock = {
  blockType: "data";
  type: string;
  name: string;
  attributes: Record<string, any>;
  innerText?: string;
};

export type VariableBlock = {
  blockType: "variable";
  name: string;
  attributes: Record<string, any>;
};

export type OutputBlock = {
  blockType: "output";
  name: string;
  attributes: Record<string, any>;
};

export type LocalsBlock = {
  blockType: "locals";
  attributes: Record<string, any>;
};

export type ProviderBlock = {
  blockType: "provider";
  type: string; // e.g. "aws"
  attributes: Record<string, any>;
};

export type TerraformBlock = {
  blockType: "terraform";
  attributes: Record<string, any>;
  innerText?: string;
};

export type Block =
  | ResourceBlock
  | DataSourceBlock
  | VariableBlock
  | OutputBlock
  | LocalsBlock
  | ProviderBlock
  | TerraformBlock;
