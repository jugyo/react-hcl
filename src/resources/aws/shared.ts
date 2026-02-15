import { Resource } from "../../components/resource";

export type GenericAwsResourceProps = {
  name: string;
  ref?: any;
  children?: string | string[];
  attributes?: Record<string, unknown>;
  [key: string]: any;
};

export function createAwsResource(type: string, props: GenericAwsResourceProps) {
  return Resource({ type, ...props });
}
