provider "aws" {
  region = "us-east-1"
}

module "network" {
  source = "./modules/network"
  user-data = "#!/bin/bash"
  ingress {
    from_port = 80
  }
  ingress {
    from_port = 443
  }
}

variable "env" {
  type = string
  default = "dev"
}

locals {
  app_name = "demo"
  dynamic = upper(var.env)
}
