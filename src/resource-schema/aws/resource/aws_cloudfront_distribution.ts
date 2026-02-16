import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudfrontDistributionResourceSchema = resource(
  "aws_cloudfront_distribution",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      aliases: attr.set().optional(),
      anycast_ip_list_id: attr.string().optional(),
      arn: attr.string().computed(),
      caller_reference: attr.string().computed(),
      comment: attr.string().optional(),
      continuous_deployment_policy_id: attr.string().optional().computed(),
      default_root_object: attr.string().optional(),
      domain_name: attr.string().computed(),
      enabled: attr.bool().required(),
      etag: attr.string().computed(),
      hosted_zone_id: attr.string().computed(),
      http_version: attr.string().optional(),
      id: attr.string().optional().computed(),
      in_progress_validation_batches: attr.number().computed(),
      is_ipv6_enabled: attr.bool().optional(),
      last_modified_time: attr.string().computed(),
      logging_v1_enabled: attr.bool().computed(),
      price_class: attr.string().optional(),
      retain_on_delete: attr.bool().optional(),
      staging: attr.bool().optional(),
      status: attr.string().computed(),
      tags: attr.map().optional(),
      tags_all: attr.map().optional().computed(),
      wait_for_deployment: attr.bool().optional(),
      web_acl_id: attr.string().optional(),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      connection_function_association: block.single(
        {
          attributes: {
            id: attr.string().required(),
          },
        },
        { maxItems: 1 },
      ),
      custom_error_response: block.set({
        attributes: {
          error_caching_min_ttl: attr.number().optional(),
          error_code: attr.number().required(),
          response_code: attr.number().optional(),
          response_page_path: attr.string().optional(),
        },
      }),
      default_cache_behavior: block.single(
        {
          attributes: {
            allowed_methods: attr.set().required(),
            cache_policy_id: attr.string().optional(),
            cached_methods: attr.set().required(),
            compress: attr.bool().optional(),
            default_ttl: attr.number().optional().computed(),
            field_level_encryption_id: attr.string().optional(),
            max_ttl: attr.number().optional().computed(),
            min_ttl: attr.number().optional(),
            origin_request_policy_id: attr.string().optional(),
            realtime_log_config_arn: attr.string().optional(),
            response_headers_policy_id: attr.string().optional(),
            smooth_streaming: attr.bool().optional(),
            target_origin_id: attr.string().required(),
            trusted_key_groups: attr.list().optional().computed(),
            trusted_signers: attr.list().optional().computed(),
            viewer_protocol_policy: attr.string().required(),
          },
          blocks: {
            forwarded_values: block.single(
              {
                attributes: {
                  headers: attr.set().optional().computed(),
                  query_string: attr.bool().required(),
                  query_string_cache_keys: attr.list().optional().computed(),
                },
                blocks: {
                  cookies: block.single(
                    {
                      attributes: {
                        forward: attr.string().required(),
                        whitelisted_names: attr.set().optional().computed(),
                      },
                    },
                    { minItems: 1, maxItems: 1 },
                  ),
                },
              },
              { maxItems: 1 },
            ),
            function_association: block.set(
              {
                attributes: {
                  event_type: attr.string().required(),
                  function_arn: attr.string().required(),
                },
              },
              { maxItems: 2 },
            ),
            grpc_config: block.single(
              {
                attributes: {
                  enabled: attr.bool().optional().computed(),
                },
              },
              { maxItems: 1 },
            ),
            lambda_function_association: block.set(
              {
                attributes: {
                  event_type: attr.string().required(),
                  include_body: attr.bool().optional(),
                  lambda_arn: attr.string().required(),
                },
              },
              { maxItems: 4 },
            ),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
      logging_config: block.single(
        {
          attributes: {
            bucket: attr.string().optional(),
            include_cookies: attr.bool().optional(),
            prefix: attr.string().optional(),
          },
        },
        { maxItems: 1 },
      ),
      ordered_cache_behavior: block.list({
        attributes: {
          allowed_methods: attr.set().required(),
          cache_policy_id: attr.string().optional(),
          cached_methods: attr.set().required(),
          compress: attr.bool().optional(),
          default_ttl: attr.number().optional().computed(),
          field_level_encryption_id: attr.string().optional(),
          max_ttl: attr.number().optional().computed(),
          min_ttl: attr.number().optional(),
          origin_request_policy_id: attr.string().optional(),
          path_pattern: attr.string().required(),
          realtime_log_config_arn: attr.string().optional(),
          response_headers_policy_id: attr.string().optional(),
          smooth_streaming: attr.bool().optional(),
          target_origin_id: attr.string().required(),
          trusted_key_groups: attr.list().optional(),
          trusted_signers: attr.list().optional(),
          viewer_protocol_policy: attr.string().required(),
        },
        blocks: {
          forwarded_values: block.single(
            {
              attributes: {
                headers: attr.set().optional().computed(),
                query_string: attr.bool().required(),
                query_string_cache_keys: attr.list().optional().computed(),
              },
              blocks: {
                cookies: block.single(
                  {
                    attributes: {
                      forward: attr.string().required(),
                      whitelisted_names: attr.set().optional(),
                    },
                  },
                  { minItems: 1, maxItems: 1 },
                ),
              },
            },
            { maxItems: 1 },
          ),
          function_association: block.set(
            {
              attributes: {
                event_type: attr.string().required(),
                function_arn: attr.string().required(),
              },
            },
            { maxItems: 2 },
          ),
          grpc_config: block.single(
            {
              attributes: {
                enabled: attr.bool().optional().computed(),
              },
            },
            { maxItems: 1 },
          ),
          lambda_function_association: block.set(
            {
              attributes: {
                event_type: attr.string().required(),
                include_body: attr.bool().optional(),
                lambda_arn: attr.string().required(),
              },
            },
            { maxItems: 4 },
          ),
        },
      }),
      origin: block.set(
        {
          attributes: {
            connection_attempts: attr.number().optional(),
            connection_timeout: attr.number().optional(),
            domain_name: attr.string().required(),
            origin_access_control_id: attr.string().optional(),
            origin_id: attr.string().required(),
            origin_path: attr.string().optional(),
            response_completion_timeout: attr.number().optional().computed(),
          },
          blocks: {
            custom_header: block.set({
              attributes: {
                name: attr.string().required(),
                value: attr.string().required(),
              },
            }),
            custom_origin_config: block.single(
              {
                attributes: {
                  http_port: attr.number().required(),
                  https_port: attr.number().required(),
                  ip_address_type: attr.string().optional(),
                  origin_keepalive_timeout: attr.number().optional(),
                  origin_protocol_policy: attr.string().required(),
                  origin_read_timeout: attr.number().optional(),
                  origin_ssl_protocols: attr.set().required(),
                },
              },
              { maxItems: 1 },
            ),
            origin_shield: block.single(
              {
                attributes: {
                  enabled: attr.bool().required(),
                  origin_shield_region: attr.string().optional(),
                },
              },
              { maxItems: 1 },
            ),
            s3_origin_config: block.single(
              {
                attributes: {
                  origin_access_identity: attr.string().required(),
                },
              },
              { maxItems: 1 },
            ),
            vpc_origin_config: block.single(
              {
                attributes: {
                  origin_keepalive_timeout: attr.number().optional(),
                  origin_read_timeout: attr.number().optional(),
                  owner_account_id: attr.string().optional(),
                  vpc_origin_id: attr.string().required(),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { minItems: 1 },
      ),
      origin_group: block.set({
        attributes: {
          origin_id: attr.string().required(),
        },
        blocks: {
          failover_criteria: block.single(
            {
              attributes: {
                status_codes: attr.set().required(),
              },
            },
            { minItems: 1, maxItems: 1 },
          ),
          member: block.list(
            {
              attributes: {
                origin_id: attr.string().required(),
              },
            },
            { minItems: 2, maxItems: 2 },
          ),
        },
      }),
      restrictions: block.single(
        {
          attributes: {},
          blocks: {
            geo_restriction: block.single(
              {
                attributes: {
                  locations: attr.set().optional().computed(),
                  restriction_type: attr.string().required(),
                },
              },
              { minItems: 1, maxItems: 1 },
            ),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
      trusted_key_groups: block.list({
        attributes: {
          enabled: attr.bool().optional(),
          items: attr.list().optional(),
        },
      }),
      trusted_signers: block.list({
        attributes: {
          enabled: attr.bool().optional(),
          items: attr.list().optional(),
        },
      }),
      viewer_certificate: block.single(
        {
          attributes: {
            acm_certificate_arn: attr.string().optional(),
            cloudfront_default_certificate: attr.bool().optional(),
            iam_certificate_id: attr.string().optional(),
            minimum_protocol_version: attr.string().optional(),
            ssl_support_method: attr.string().optional(),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
      viewer_mtls_config: block.single(
        {
          attributes: {
            mode: attr.string().optional(),
          },
          blocks: {
            trust_store_config: block.single(
              {
                attributes: {
                  advertise_trust_store_ca_names: attr.bool().optional(),
                  ignore_certificate_expiry: attr.bool().optional(),
                  trust_store_id: attr.string().required(),
                },
              },
              { maxItems: 1 },
            ),
          },
        },
        { maxItems: 1 },
      ),
    },
  },
);
