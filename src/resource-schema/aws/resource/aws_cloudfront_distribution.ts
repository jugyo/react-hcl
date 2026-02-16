import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/cloudfront_distribution
export const awsCloudfrontDistributionResourceSchema = {
  kind: "resource",
  type: "aws_cloudfront_distribution",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    aliases: { valueType: "set", optional: true },
    arn: { valueType: "string", computed: true },
    caller_reference: { valueType: "string", computed: true },
    comment: { valueType: "string", optional: true },
    default_root_object: { valueType: "string", optional: true },
    domain_name: { valueType: "string", computed: true },
    enabled: { valueType: "bool", required: true },
    etag: { valueType: "string", computed: true },
    hosted_zone_id: { valueType: "string", computed: true },
    http_version: { valueType: "string", optional: true },
    is_ipv6_enabled: { valueType: "bool", optional: true },
    price_class: { valueType: "string", optional: true },
    retain_on_delete: { valueType: "bool", optional: true },
    staging: { valueType: "bool", optional: true },
    status: { valueType: "string", computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    wait_for_deployment: { valueType: "bool", optional: true },
    web_acl_id: { valueType: "string", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    custom_error_response: {
      nestingMode: "list",
      attributes: {
        error_caching_min_ttl: { valueType: "number", optional: true },
        error_code: { valueType: "number", required: true },
        response_code: { valueType: "number", optional: true },
        response_page_path: { valueType: "string", optional: true },
      },
    },
    default_cache_behavior: {
      nestingMode: "list",
      maxItems: 1,
      attributes: {
        allowed_methods: { valueType: "set", required: true },
        cache_policy_id: { valueType: "string", optional: true },
        cached_methods: { valueType: "set", required: true },
        compress: { valueType: "bool", optional: true },
        default_ttl: { valueType: "number", optional: true },
        max_ttl: { valueType: "number", optional: true },
        min_ttl: { valueType: "number", optional: true },
        origin_request_policy_id: { valueType: "string", optional: true },
        response_headers_policy_id: { valueType: "string", optional: true },
        smooth_streaming: { valueType: "bool", optional: true },
        target_origin_id: { valueType: "string", required: true },
        trusted_key_groups: { valueType: "set", optional: true },
        trusted_signers: { valueType: "set", optional: true },
        viewer_protocol_policy: { valueType: "string", required: true },
      },
      blocks: {
        forwarded_values: {
          nestingMode: "list",
          maxItems: 1,
          attributes: {
            headers: { valueType: "set", optional: true },
            query_string: { valueType: "bool", required: true },
            query_string_cache_keys: { valueType: "set", optional: true },
          },
          blocks: {
            cookies: {
              nestingMode: "list",
              maxItems: 1,
              attributes: {
                forward: { valueType: "string", required: true },
                whitelisted_names: { valueType: "set", optional: true },
              },
            },
          },
        },
        function_association: {
          nestingMode: "list",
          attributes: {
            event_type: { valueType: "string", required: true },
            function_arn: { valueType: "string", required: true },
          },
        },
        lambda_function_association: {
          nestingMode: "list",
          attributes: {
            event_type: { valueType: "string", required: true },
            include_body: { valueType: "bool", optional: true },
            lambda_arn: { valueType: "string", required: true },
          },
        },
      },
    },
    logging_config: {
      nestingMode: "single",
      attributes: {
        bucket: { valueType: "string", required: true },
        include_cookies: { valueType: "bool", optional: true },
        prefix: { valueType: "string", optional: true },
      },
    },
    ordered_cache_behavior: {
      nestingMode: "list",
      attributes: {
        allowed_methods: { valueType: "set", required: true },
        cache_policy_id: { valueType: "string", optional: true },
        cached_methods: { valueType: "set", required: true },
        compress: { valueType: "bool", optional: true },
        default_ttl: { valueType: "number", optional: true },
        max_ttl: { valueType: "number", optional: true },
        min_ttl: { valueType: "number", optional: true },
        origin_request_policy_id: { valueType: "string", optional: true },
        path_pattern: { valueType: "string", required: true },
        response_headers_policy_id: { valueType: "string", optional: true },
        smooth_streaming: { valueType: "bool", optional: true },
        target_origin_id: { valueType: "string", required: true },
        trusted_key_groups: { valueType: "set", optional: true },
        trusted_signers: { valueType: "set", optional: true },
        viewer_protocol_policy: { valueType: "string", required: true },
      },
    },
    origin: {
      nestingMode: "list",
      attributes: {
        connection_attempts: { valueType: "number", optional: true },
        connection_timeout: { valueType: "number", optional: true },
        domain_name: { valueType: "string", required: true },
        origin_id: { valueType: "string", required: true },
        origin_path: { valueType: "string", optional: true },
      },
      blocks: {
        custom_header: {
          nestingMode: "list",
          attributes: {
            name: { valueType: "string", required: true },
            value: { valueType: "string", required: true },
          },
        },
        custom_origin_config: {
          nestingMode: "list",
          maxItems: 1,
          attributes: {
            http_port: { valueType: "number", required: true },
            https_port: { valueType: "number", required: true },
            origin_keepalive_timeout: { valueType: "number", optional: true },
            origin_protocol_policy: { valueType: "string", required: true },
            origin_read_timeout: { valueType: "number", optional: true },
            origin_ssl_protocols: { valueType: "set", required: true },
          },
        },
        origin_shield: {
          nestingMode: "single",
          attributes: {
            enabled: { valueType: "bool", required: true },
            origin_shield_region: { valueType: "string", required: true },
          },
        },
        s3_origin_config: {
          nestingMode: "single",
          attributes: {
            origin_access_identity: { valueType: "string", optional: true },
          },
        },
        vpc_origin_config: {
          nestingMode: "single",
          attributes: {
            origin_keepalive_timeout: { valueType: "number", optional: true },
            origin_read_timeout: { valueType: "number", optional: true },
            vpc_origin_id: { valueType: "string", required: true },
          },
        },
      },
    },
    origin_group: {
      nestingMode: "list",
      attributes: {
        origin_id: { valueType: "string", required: true },
      },
    },
    restrictions: {
      nestingMode: "list",
      maxItems: 1,
      attributes: {},
      blocks: {
        geo_restriction: {
          nestingMode: "list",
          maxItems: 1,
          attributes: {
            locations: { valueType: "set", optional: true },
            restriction_type: { valueType: "string", required: true },
          },
        },
      },
    },
    viewer_certificate: {
      nestingMode: "list",
      maxItems: 1,
      attributes: {
        acm_certificate_arn: { valueType: "string", optional: true },
        cloudfront_default_certificate: { valueType: "bool", optional: true },
        iam_certificate_id: { valueType: "string", optional: true },
        minimum_protocol_version: { valueType: "string", optional: true },
        ssl_support_method: { valueType: "string", optional: true },
      },
    },
  },
} as const satisfies TerraformTypeSchema;
