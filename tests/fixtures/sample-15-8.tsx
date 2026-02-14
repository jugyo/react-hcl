import { Terraform } from "react-hcl";

export default (
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
);
