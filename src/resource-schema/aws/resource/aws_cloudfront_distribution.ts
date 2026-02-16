import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsCloudfrontDistributionResourceSchema = resource(
  "aws_cloudfront_distribution",
  {
    attributes: {
      ...COMMON_RESOURCE_ATTRIBUTES,
      aliases: attr.set({ optional: true }),
      anycast_ip_list_id: attr.string({ optional: true }),
      arn: attr.string({ computed: true }),
      caller_reference: attr.string({ computed: true }),
      comment: attr.string({ optional: true }),
      continuous_deployment_policy_id: attr.string({
        optional: true,
        computed: true,
      }),
      default_root_object: attr.string({ optional: true }),
      domain_name: attr.string({ computed: true }),
      enabled: attr.bool({ required: true }),
      etag: attr.string({ computed: true }),
      hosted_zone_id: attr.string({ computed: true }),
      http_version: attr.string({ optional: true }),
      id: attr.string({ optional: true, computed: true }),
      in_progress_validation_batches: attr.number({ computed: true }),
      is_ipv6_enabled: attr.bool({ optional: true }),
      last_modified_time: attr.string({ computed: true }),
      logging_v1_enabled: attr.bool({ computed: true }),
      price_class: attr.string({ optional: true }),
      retain_on_delete: attr.bool({ optional: true }),
      staging: attr.bool({ optional: true }),
      status: attr.string({ computed: true }),
      tags: attr.map({ optional: true }),
      tags_all: attr.map({ optional: true, computed: true }),
      wait_for_deployment: attr.bool({ optional: true }),
      web_acl_id: attr.string({ optional: true }),
    },
    blocks: {
      ...COMMON_RESOURCE_BLOCKS,
      connection_function_association: block.single(
        {
          attributes: {
            id: attr.string({ required: true }),
          },
        },
        { maxItems: 1 },
      ),
      custom_error_response: block.set({
        attributes: {
          error_caching_min_ttl: attr.number({ optional: true }),
          error_code: attr.number({ required: true }),
          response_code: attr.number({ optional: true }),
          response_page_path: attr.string({ optional: true }),
        },
      }),
      default_cache_behavior: block.single(
        {
          attributes: {
            allowed_methods: attr.set({ required: true }),
            cache_policy_id: attr.string({ optional: true }),
            cached_methods: attr.set({ required: true }),
            compress: attr.bool({ optional: true }),
            default_ttl: attr.number({ optional: true, computed: true }),
            field_level_encryption_id: attr.string({ optional: true }),
            max_ttl: attr.number({ optional: true, computed: true }),
            min_ttl: attr.number({ optional: true }),
            origin_request_policy_id: attr.string({ optional: true }),
            realtime_log_config_arn: attr.string({ optional: true }),
            response_headers_policy_id: attr.string({ optional: true }),
            smooth_streaming: attr.bool({ optional: true }),
            target_origin_id: attr.string({ required: true }),
            trusted_key_groups: attr.list({ optional: true, computed: true }),
            trusted_signers: attr.list({ optional: true, computed: true }),
            viewer_protocol_policy: attr.string({ required: true }),
          },
          blocks: {
            forwarded_values: block.single(
              {
                attributes: {
                  headers: attr.set({ optional: true, computed: true }),
                  query_string: attr.bool({ required: true }),
                  query_string_cache_keys: attr.list({
                    optional: true,
                    computed: true,
                  }),
                },
                blocks: {
                  cookies: block.single(
                    {
                      attributes: {
                        forward: attr.string({ required: true }),
                        whitelisted_names: attr.set({
                          optional: true,
                          computed: true,
                        }),
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
                  event_type: attr.string({ required: true }),
                  function_arn: attr.string({ required: true }),
                },
              },
              { maxItems: 2 },
            ),
            grpc_config: block.single(
              {
                attributes: {
                  enabled: attr.bool({ optional: true, computed: true }),
                },
              },
              { maxItems: 1 },
            ),
            lambda_function_association: block.set(
              {
                attributes: {
                  event_type: attr.string({ required: true }),
                  include_body: attr.bool({ optional: true }),
                  lambda_arn: attr.string({ required: true }),
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
            bucket: attr.string({ optional: true }),
            include_cookies: attr.bool({ optional: true }),
            prefix: attr.string({ optional: true }),
          },
        },
        { maxItems: 1 },
      ),
      ordered_cache_behavior: block.list({
        attributes: {
          allowed_methods: attr.set({ required: true }),
          cache_policy_id: attr.string({ optional: true }),
          cached_methods: attr.set({ required: true }),
          compress: attr.bool({ optional: true }),
          default_ttl: attr.number({ optional: true, computed: true }),
          field_level_encryption_id: attr.string({ optional: true }),
          max_ttl: attr.number({ optional: true, computed: true }),
          min_ttl: attr.number({ optional: true }),
          origin_request_policy_id: attr.string({ optional: true }),
          path_pattern: attr.string({ required: true }),
          realtime_log_config_arn: attr.string({ optional: true }),
          response_headers_policy_id: attr.string({ optional: true }),
          smooth_streaming: attr.bool({ optional: true }),
          target_origin_id: attr.string({ required: true }),
          trusted_key_groups: attr.list({ optional: true }),
          trusted_signers: attr.list({ optional: true }),
          viewer_protocol_policy: attr.string({ required: true }),
        },
        blocks: {
          forwarded_values: block.single(
            {
              attributes: {
                headers: attr.set({ optional: true, computed: true }),
                query_string: attr.bool({ required: true }),
                query_string_cache_keys: attr.list({
                  optional: true,
                  computed: true,
                }),
              },
              blocks: {
                cookies: block.single(
                  {
                    attributes: {
                      forward: attr.string({ required: true }),
                      whitelisted_names: attr.set({ optional: true }),
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
                event_type: attr.string({ required: true }),
                function_arn: attr.string({ required: true }),
              },
            },
            { maxItems: 2 },
          ),
          grpc_config: block.single(
            {
              attributes: {
                enabled: attr.bool({ optional: true, computed: true }),
              },
            },
            { maxItems: 1 },
          ),
          lambda_function_association: block.set(
            {
              attributes: {
                event_type: attr.string({ required: true }),
                include_body: attr.bool({ optional: true }),
                lambda_arn: attr.string({ required: true }),
              },
            },
            { maxItems: 4 },
          ),
        },
      }),
      origin: block.set(
        {
          attributes: {
            connection_attempts: attr.number({ optional: true }),
            connection_timeout: attr.number({ optional: true }),
            domain_name: attr.string({ required: true }),
            origin_access_control_id: attr.string({ optional: true }),
            origin_id: attr.string({ required: true }),
            origin_path: attr.string({ optional: true }),
            response_completion_timeout: attr.number({
              optional: true,
              computed: true,
            }),
          },
          blocks: {
            custom_header: block.set({
              attributes: {
                name: attr.string({ required: true }),
                value: attr.string({ required: true }),
              },
            }),
            custom_origin_config: block.single(
              {
                attributes: {
                  http_port: attr.number({ required: true }),
                  https_port: attr.number({ required: true }),
                  ip_address_type: attr.string({ optional: true }),
                  origin_keepalive_timeout: attr.number({ optional: true }),
                  origin_protocol_policy: attr.string({ required: true }),
                  origin_read_timeout: attr.number({ optional: true }),
                  origin_ssl_protocols: attr.set({ required: true }),
                },
              },
              { maxItems: 1 },
            ),
            origin_shield: block.single(
              {
                attributes: {
                  enabled: attr.bool({ required: true }),
                  origin_shield_region: attr.string({ optional: true }),
                },
              },
              { maxItems: 1 },
            ),
            s3_origin_config: block.single(
              {
                attributes: {
                  origin_access_identity: attr.string({ required: true }),
                },
              },
              { maxItems: 1 },
            ),
            vpc_origin_config: block.single(
              {
                attributes: {
                  origin_keepalive_timeout: attr.number({ optional: true }),
                  origin_read_timeout: attr.number({ optional: true }),
                  owner_account_id: attr.string({ optional: true }),
                  vpc_origin_id: attr.string({ required: true }),
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
          origin_id: attr.string({ required: true }),
        },
        blocks: {
          failover_criteria: block.single(
            {
              attributes: {
                status_codes: attr.set({ required: true }),
              },
            },
            { minItems: 1, maxItems: 1 },
          ),
          member: block.list(
            {
              attributes: {
                origin_id: attr.string({ required: true }),
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
                  locations: attr.set({ optional: true, computed: true }),
                  restriction_type: attr.string({ required: true }),
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
          enabled: attr.bool({ optional: true }),
          items: attr.list({ optional: true }),
        },
      }),
      trusted_signers: block.list({
        attributes: {
          enabled: attr.bool({ optional: true }),
          items: attr.list({ optional: true }),
        },
      }),
      viewer_certificate: block.single(
        {
          attributes: {
            acm_certificate_arn: attr.string({ optional: true }),
            cloudfront_default_certificate: attr.bool({ optional: true }),
            iam_certificate_id: attr.string({ optional: true }),
            minimum_protocol_version: attr.string({ optional: true }),
            ssl_support_method: attr.string({ optional: true }),
          },
        },
        { minItems: 1, maxItems: 1 },
      ),
      viewer_mtls_config: block.single(
        {
          attributes: {
            mode: attr.string({ optional: true }),
          },
          blocks: {
            trust_store_config: block.single(
              {
                attributes: {
                  advertise_trust_store_ca_names: attr.bool({ optional: true }),
                  ignore_certificate_expiry: attr.bool({ optional: true }),
                  trust_store_id: attr.string({ required: true }),
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
