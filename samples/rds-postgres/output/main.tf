terraform {
  required_version = ">= 1.2.8"

  required_providers = {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_security_group" "rds" {
  vpc_id      = data.aws_vpc.default.id
  description = "RDS security group"
}

resource "aws_vpc_security_group_ingress_rule" "rds_postgres" {
  security_group_id = aws_security_group.rds.id
  from_port         = 5432
  to_port           = 5432
  ip_protocol       = "tcp"
  cidr_ipv4         = "10.0.0.0/16"
}

resource "aws_vpc_security_group_egress_rule" "rds_all" {
  security_group_id = aws_security_group.rds.id
  ip_protocol       = "-1"
  cidr_ipv4         = "0.0.0.0/0"
}

resource "aws_db_subnet_group" "main" {
  name_prefix = "example-rds-"
  subnet_ids  = data.aws_subnets.default.ids
}

resource "aws_db_instance" "main" {
  identifier              = "react-hcl-rds-example"
  engine                  = "postgres"
  engine_version          = "16.3"
  instance_class          = "db.t4g.micro"
  allocated_storage       = 20
  db_name                 = "app"
  username                = "app"
  password                = "example-password-change-me"
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  storage_encrypted       = true
  skip_final_snapshot     = true
  backup_retention_period = 7

  lifecycle {
    prevent_destroy = true
  }
}

output "db_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "db_arn" {
  value = aws_db_instance.main.arn
}
