declare const reactHclSchemaModeBrand: unique symbol;
declare const resourceTypeMapBrand: unique symbol;
declare const dataTypeMapBrand: unique symbol;
declare const providerTypeMapBrand: unique symbol;

export interface ReactHclSchemaMode {
  [reactHclSchemaModeBrand]?: never;
}

export interface ResourceTypeMap {
  [resourceTypeMapBrand]?: never;
}

export interface DataTypeMap {
  [dataTypeMapBrand]?: never;
}

export interface ProviderTypeMap {
  [providerTypeMapBrand]?: never;
}
