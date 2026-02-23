terraform {
  required_version = ">= 1.2.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_cloudfront_distribution" "main" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "react-hcl cloudfront example"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  wait_for_deployment = false
  origin              = [{ domain_name = "example.com", origin_id = "example-origin", custom_origin_config = { http_port = 80, https_port = 443, origin_protocol_policy = "https-only", origin_ssl_protocols = ["TLSv1.2"] } }]

  default_cache_behavior = {
    target_origin_id       = "example-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400

    forwarded_values = {
      query_string = false

      cookies = {
        forward = "none"
      }
    }
  }

  restrictions = {
    geo_restriction = {
      restriction_type = "none"
    }
  }

  viewer_certificate = {
    cloudfront_default_certificate = true
  }
}

output "distribution_domain_name" {
  value = aws_cloudfront_distribution.main.domain_name
}

output "distribution_id" {
  value = aws_cloudfront_distribution.main.id
}
