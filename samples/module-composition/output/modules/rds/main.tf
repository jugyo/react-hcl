terraform {
  required_version = ">= 1.2.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for the DB subnet group"
}

resource "aws_db_subnet_group" "main" {
  subnet_ids = var.subnet_ids

  tags = {
    Name = "db-subnet-group"
  }
}

resource "aws_db_instance" "main" {
  engine               = "mysql"
  engine_version       = "8.0"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_subnet_group_name = aws_db_subnet_group.main.name
  skip_final_snapshot  = true

  tags = {
    Name = "main-db"
  }
}

output "endpoint" {
  value = aws_db_instance.main.endpoint
}
