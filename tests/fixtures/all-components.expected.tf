terraform {
  required_version = ">= 1.0"
}

provider "aws" {
  region = "ap-northeast-1"
}

variable "environment" {
  type    = string
  default = "dev"
}

locals {
  environment = "prod"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

data "aws_ami" "latest" {
  most_recent = true
}

output "vpc_id" {
  value = "aws_vpc.main.id"
}
