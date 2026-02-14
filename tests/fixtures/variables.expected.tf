variable "environment" {
  type    = string
  default = "dev"
}

locals {
  common_tags = {
    Environment = var.environment
  }
}

resource "aws_instance" "web" {
  ami           = "ami-xxx"
  instance_type = "t3.micro"
  tags          = local.common_tags
}
