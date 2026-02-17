import { Output, Provider, Resource, Terraform, useRef } from "react-hcl";

function Main({ region }: { region: string }) {
  const distributionRef = useRef();

  return (
    <>
      <Terraform
        required_version=">= 1.2.8"
        required_providers={{
          aws: {
            source: "hashicorp/aws",
            version: "~> 6.0",
          },
        }}
      />
      <Provider type="aws" region={region} />

      <Resource
        type="aws_cloudfront_distribution"
        label="main"
        ref={distributionRef}
        enabled={true}
        is_ipv6_enabled={true}
        comment="react-hcl cloudfront example"
        default_root_object="index.html"
        price_class="PriceClass_100"
        wait_for_deployment={false}
        origin={[
          {
            domain_name: "example.com",
            origin_id: "example-origin",
            custom_origin_config: {
              http_port: 80,
              https_port: 443,
              origin_protocol_policy: "https-only",
              origin_ssl_protocols: ["TLSv1.2"],
            },
          },
        ]}
        default_cache_behavior={{
          target_origin_id: "example-origin",
          viewer_protocol_policy: "redirect-to-https",
          allowed_methods: ["GET", "HEAD", "OPTIONS"],
          cached_methods: ["GET", "HEAD"],
          compress: true,
          min_ttl: 0,
          default_ttl: 3600,
          max_ttl: 86400,
          forwarded_values: {
            query_string: false,
            cookies: {
              forward: "none",
            },
          },
        }}
        restrictions={{
          geo_restriction: {
            restriction_type: "none",
          },
        }}
        viewer_certificate={{
          cloudfront_default_certificate: true,
        }}
      />

      <Output
        name="distribution_domain_name"
        value={distributionRef.domain_name}
      />
      <Output name="distribution_id" value={distributionRef.id} />
    </>
  );
}

export default <Main region="us-east-1" />;
