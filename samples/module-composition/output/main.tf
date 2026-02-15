provider "aws" {
  region = "us-east-1"
}

module "networking" {
  source      = "./modules/networking"
  vpc_cidr    = "10.0.0.0/16"
  environment = "production"
}

module "database" {
  source     = "./modules/rds"
  vpc_id     = module.networking.vpc_id
  subnet_ids = module.networking.private_subnet_ids
  depends_on = [module.networking]
}

output "vpc_id" {
  value = module.networking.vpc_id
}

output "database_endpoint" {
  value = module.database.endpoint
}
