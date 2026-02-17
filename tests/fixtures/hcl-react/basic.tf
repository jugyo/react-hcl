terraform {
  required_version = ">= 1.5.0"
}

resource "aws_instance" "web" {
  ami           = data.aws_ami.al2.id
  instance_type = "t3.micro"

  root_block_device {
    volume_size = 20
  }

  tags = {
    Name = "web"
    Env  = var.env
  }
}

output "instance_id" {
  value = aws_instance.web.id
}
