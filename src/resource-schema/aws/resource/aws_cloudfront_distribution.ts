import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudfrontDistributionResourceSchema = resource(
  "aws_cloudfront_distribution",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      aliases: { valueType: "set", optional: true },
      anycast_ip_list_id: { valueType: "string", optional: true },
      arn: { valueType: "string", computed: true },
      caller_reference: { valueType: "string", computed: true },
      comment: { valueType: "string", optional: true },
      continuous_deployment_policy_id: {
        valueType: "string",
        optional: true,
        computed: true,
      },
      default_root_object: { valueType: "string", optional: true },
      domain_name: { valueType: "string", computed: true },
      enabled: { valueType: "bool", required: true },
      etag: { valueType: "string", computed: true },
      hosted_zone_id: { valueType: "string", computed: true },
      http_version: { valueType: "string", optional: true },
      id: { valueType: "string", optional: true, computed: true },
      in_progress_validation_batches: { valueType: "number", computed: true },
      is_ipv6_enabled: { valueType: "bool", optional: true },
      last_modified_time: { valueType: "string", computed: true },
      logging_v1_enabled: { valueType: "bool", computed: true },
      price_class: { valueType: "string", optional: true },
      retain_on_delete: { valueType: "bool", optional: true },
      staging: { valueType: "bool", optional: true },
      status: { valueType: "string", computed: true },
      tags: { valueType: "map", optional: true },
      tags_all: { valueType: "map", optional: true, computed: true },
      wait_for_deployment: { valueType: "bool", optional: true },
      web_acl_id: { valueType: "string", optional: true },
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      connection_function_association: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          id: { valueType: "string", required: true },
        },
      },
      custom_error_response: {
        nestingMode: "set",
        attributes: {
          error_caching_min_ttl: { valueType: "number", optional: true },
          error_code: { valueType: "number", required: true },
          response_code: { valueType: "number", optional: true },
          response_page_path: { valueType: "string", optional: true },
        },
      },
      default_cache_behavior: {
        nestingMode: "single",
        minItems: 1,
        maxItems: 1,
        attributes: {
          allowed_methods: { valueType: "set", required: true },
          cache_policy_id: { valueType: "string", optional: true },
          cached_methods: { valueType: "set", required: true },
          compress: { valueType: "bool", optional: true },
          default_ttl: { valueType: "number", optional: true, computed: true },
          field_level_encryption_id: { valueType: "string", optional: true },
          max_ttl: { valueType: "number", optional: true, computed: true },
          min_ttl: { valueType: "number", optional: true },
          origin_request_policy_id: { valueType: "string", optional: true },
          realtime_log_config_arn: { valueType: "string", optional: true },
          response_headers_policy_id: { valueType: "string", optional: true },
          smooth_streaming: { valueType: "bool", optional: true },
          target_origin_id: { valueType: "string", required: true },
          trusted_key_groups: {
            valueType: "list",
            optional: true,
            computed: true,
          },
          trusted_signers: {
            valueType: "list",
            optional: true,
            computed: true,
          },
          viewer_protocol_policy: { valueType: "string", required: true },
        },
        blocks: {
          forwarded_values: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              headers: { valueType: "set", optional: true, computed: true },
              query_string: { valueType: "bool", required: true },
              query_string_cache_keys: {
                valueType: "list",
                optional: true,
                computed: true,
              },
            },
            blocks: {
              cookies: {
                nestingMode: "single",
                minItems: 1,
                maxItems: 1,
                attributes: {
                  forward: { valueType: "string", required: true },
                  whitelisted_names: {
                    valueType: "set",
                    optional: true,
                    computed: true,
                  },
                },
              },
            },
          },
          function_association: {
            nestingMode: "set",
            maxItems: 2,
            attributes: {
              event_type: { valueType: "string", required: true },
              function_arn: { valueType: "string", required: true },
            },
          },
          grpc_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              enabled: { valueType: "bool", optional: true, computed: true },
            },
          },
          lambda_function_association: {
            nestingMode: "set",
            maxItems: 4,
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
        maxItems: 1,
        attributes: {
          bucket: { valueType: "string", optional: true },
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
          default_ttl: { valueType: "number", optional: true, computed: true },
          field_level_encryption_id: { valueType: "string", optional: true },
          max_ttl: { valueType: "number", optional: true, computed: true },
          min_ttl: { valueType: "number", optional: true },
          origin_request_policy_id: { valueType: "string", optional: true },
          path_pattern: { valueType: "string", required: true },
          realtime_log_config_arn: { valueType: "string", optional: true },
          response_headers_policy_id: { valueType: "string", optional: true },
          smooth_streaming: { valueType: "bool", optional: true },
          target_origin_id: { valueType: "string", required: true },
          trusted_key_groups: { valueType: "list", optional: true },
          trusted_signers: { valueType: "list", optional: true },
          viewer_protocol_policy: { valueType: "string", required: true },
        },
        blocks: {
          forwarded_values: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              headers: { valueType: "set", optional: true, computed: true },
              query_string: { valueType: "bool", required: true },
              query_string_cache_keys: {
                valueType: "list",
                optional: true,
                computed: true,
              },
            },
            blocks: {
              cookies: {
                nestingMode: "single",
                minItems: 1,
                maxItems: 1,
                attributes: {
                  forward: { valueType: "string", required: true },
                  whitelisted_names: { valueType: "set", optional: true },
                },
              },
            },
          },
          function_association: {
            nestingMode: "set",
            maxItems: 2,
            attributes: {
              event_type: { valueType: "string", required: true },
              function_arn: { valueType: "string", required: true },
            },
          },
          grpc_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              enabled: { valueType: "bool", optional: true, computed: true },
            },
          },
          lambda_function_association: {
            nestingMode: "set",
            maxItems: 4,
            attributes: {
              event_type: { valueType: "string", required: true },
              include_body: { valueType: "bool", optional: true },
              lambda_arn: { valueType: "string", required: true },
            },
          },
        },
      },
      origin: {
        nestingMode: "set",
        minItems: 1,
        attributes: {
          connection_attempts: { valueType: "number", optional: true },
          connection_timeout: { valueType: "number", optional: true },
          domain_name: { valueType: "string", required: true },
          origin_access_control_id: { valueType: "string", optional: true },
          origin_id: { valueType: "string", required: true },
          origin_path: { valueType: "string", optional: true },
          response_completion_timeout: {
            valueType: "number",
            optional: true,
            computed: true,
          },
        },
        blocks: {
          custom_header: {
            nestingMode: "set",
            attributes: {
              name: { valueType: "string", required: true },
              value: { valueType: "string", required: true },
            },
          },
          custom_origin_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              http_port: { valueType: "number", required: true },
              https_port: { valueType: "number", required: true },
              ip_address_type: { valueType: "string", optional: true },
              origin_keepalive_timeout: { valueType: "number", optional: true },
              origin_protocol_policy: { valueType: "string", required: true },
              origin_read_timeout: { valueType: "number", optional: true },
              origin_ssl_protocols: { valueType: "set", required: true },
            },
          },
          origin_shield: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              enabled: { valueType: "bool", required: true },
              origin_shield_region: { valueType: "string", optional: true },
            },
          },
          s3_origin_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              origin_access_identity: { valueType: "string", required: true },
            },
          },
          vpc_origin_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              origin_keepalive_timeout: { valueType: "number", optional: true },
              origin_read_timeout: { valueType: "number", optional: true },
              owner_account_id: { valueType: "string", optional: true },
              vpc_origin_id: { valueType: "string", required: true },
            },
          },
        },
      },
      origin_group: {
        nestingMode: "set",
        attributes: {
          origin_id: { valueType: "string", required: true },
        },
        blocks: {
          failover_criteria: {
            nestingMode: "single",
            minItems: 1,
            maxItems: 1,
            attributes: {
              status_codes: { valueType: "set", required: true },
            },
          },
          member: {
            nestingMode: "list",
            minItems: 2,
            maxItems: 2,
            attributes: {
              origin_id: { valueType: "string", required: true },
            },
          },
        },
      },
      restrictions: {
        nestingMode: "single",
        minItems: 1,
        maxItems: 1,
        attributes: {},
        blocks: {
          geo_restriction: {
            nestingMode: "single",
            minItems: 1,
            maxItems: 1,
            attributes: {
              locations: { valueType: "set", optional: true, computed: true },
              restriction_type: { valueType: "string", required: true },
            },
          },
        },
      },
      trusted_key_groups: {
        nestingMode: "list",
        attributes: {
          enabled: { valueType: "bool", optional: true },
          items: { valueType: "list", optional: true },
        },
      },
      trusted_signers: {
        nestingMode: "list",
        attributes: {
          enabled: { valueType: "bool", optional: true },
          items: { valueType: "list", optional: true },
        },
      },
      viewer_certificate: {
        nestingMode: "single",
        minItems: 1,
        maxItems: 1,
        attributes: {
          acm_certificate_arn: { valueType: "string", optional: true },
          cloudfront_default_certificate: { valueType: "bool", optional: true },
          iam_certificate_id: { valueType: "string", optional: true },
          minimum_protocol_version: { valueType: "string", optional: true },
          ssl_support_method: { valueType: "string", optional: true },
        },
      },
      viewer_mtls_config: {
        nestingMode: "single",
        maxItems: 1,
        attributes: {
          mode: { valueType: "string", optional: true },
        },
        blocks: {
          trust_store_config: {
            nestingMode: "single",
            maxItems: 1,
            attributes: {
              advertise_trust_store_ca_names: {
                valueType: "bool",
                optional: true,
              },
              ignore_certificate_expiry: { valueType: "bool", optional: true },
              trust_store_id: { valueType: "string", required: true },
            },
          },
        },
      },
    },
  },
);
