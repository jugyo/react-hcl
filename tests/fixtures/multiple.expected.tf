resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}
