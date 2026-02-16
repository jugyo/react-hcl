import type { TerraformTypeSchema } from "../../types";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

// Source: https://developer.hashicorp.com/terraform/providers/hashicorp/aws/latest/docs/resources/instance
export const awsInstanceResourceSchema: TerraformTypeSchema = {
  kind: "resource",
  type: "aws_instance",
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    ami: { valueType: "string", optional: true },
    arn: { valueType: "string", computed: true },
    associate_public_ip_address: { valueType: "bool", optional: true },
    availability_zone: { valueType: "string", optional: true },
    disable_api_stop: { valueType: "bool", optional: true },
    disable_api_termination: { valueType: "bool", optional: true },
    ebs_optimized: { valueType: "bool", optional: true },
    get_password_data: { valueType: "bool", optional: true },
    hibernation: { valueType: "bool", optional: true },
    iam_instance_profile: { valueType: "string", optional: true },
    instance_initiated_shutdown_behavior: {
      valueType: "string",
      optional: true,
    },
    instance_state: { valueType: "string", computed: true },
    instance_type: { valueType: "string", optional: true },
    ipv6_address_count: { valueType: "number", optional: true },
    ipv6_addresses: { valueType: "list", optional: true },
    key_name: { valueType: "string", optional: true },
    monitoring: { valueType: "bool", optional: true },
    outpost_arn: { valueType: "string", optional: true },
    password_data: { valueType: "string", computed: true, sensitive: true },
    placement_group: { valueType: "string", optional: true },
    placement_partition_number: { valueType: "number", optional: true },
    private_dns: { valueType: "string", computed: true },
    private_ip: { valueType: "string", optional: true },
    public_dns: { valueType: "string", computed: true },
    public_ip: { valueType: "string", computed: true },
    secondary_private_ips: { valueType: "list", optional: true },
    security_groups: { valueType: "set", optional: true },
    source_dest_check: { valueType: "bool", optional: true },
    subnet_id: { valueType: "string", optional: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", computed: true },
    tenancy: { valueType: "string", optional: true },
    user_data: { valueType: "string", optional: true },
    user_data_base64: { valueType: "string", optional: true },
    user_data_replace_on_change: { valueType: "bool", optional: true },
    volume_tags: { valueType: "map", optional: true },
    vpc_security_group_ids: { valueType: "set", optional: true },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    capacity_reservation_specification: {
      nestingMode: "single",
      attributes: {},
      blocks: {
        capacity_reservation_target: {
          nestingMode: "single",
          attributes: {
            capacity_reservation_id: { valueType: "string", optional: true },
            capacity_reservation_resource_group_arn: {
              valueType: "string",
              optional: true,
            },
          },
        },
      },
    },
    cpu_options: {
      nestingMode: "single",
      attributes: {
        amd_sev_snp: { valueType: "string", optional: true },
        core_count: { valueType: "number", optional: true },
        threads_per_core: { valueType: "number", optional: true },
      },
    },
    credit_specification: {
      nestingMode: "single",
      attributes: {
        cpu_credits: { valueType: "string", optional: true },
      },
    },
    enclave_options: {
      nestingMode: "single",
      attributes: {
        enabled: { valueType: "bool", optional: true },
      },
    },
    ebs_block_device: {
      nestingMode: "list",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_name: { valueType: "string", required: true },
        encrypted: { valueType: "bool", optional: true },
        iops: { valueType: "number", optional: true },
        kms_key_id: { valueType: "string", optional: true },
        snapshot_id: { valueType: "string", optional: true },
        tags: { valueType: "map", optional: true },
        throughput: { valueType: "number", optional: true },
        volume_size: { valueType: "number", optional: true },
        volume_type: { valueType: "string", optional: true },
      },
    },
    ephemeral_block_device: {
      nestingMode: "list",
      attributes: {
        device_name: { valueType: "string", required: true },
        no_device: { valueType: "bool", optional: true },
        virtual_name: { valueType: "string", optional: true },
      },
    },
    launch_template: {
      nestingMode: "single",
      attributes: {
        id: { valueType: "string", optional: true },
        name: { valueType: "string", optional: true },
        version: { valueType: "string", optional: true },
      },
    },
    maintenance_options: {
      nestingMode: "single",
      attributes: {
        auto_recovery: { valueType: "string", optional: true },
      },
    },
    metadata_options: {
      nestingMode: "single",
      attributes: {
        http_endpoint: { valueType: "string", optional: true },
        http_protocol_ipv6: { valueType: "string", optional: true },
        http_put_response_hop_limit: { valueType: "number", optional: true },
        http_tokens: { valueType: "string", optional: true },
        instance_metadata_tags: { valueType: "string", optional: true },
      },
    },
    network_interface: {
      nestingMode: "list",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_index: { valueType: "number", required: true },
        network_card_index: { valueType: "number", optional: true },
        network_interface_id: { valueType: "string", required: true },
      },
    },
    private_dns_name_options: {
      nestingMode: "single",
      attributes: {
        enable_resource_name_dns_a_record: {
          valueType: "bool",
          optional: true,
        },
        enable_resource_name_dns_aaaa_record: {
          valueType: "bool",
          optional: true,
        },
        hostname_type: { valueType: "string", optional: true },
      },
    },
    root_block_device: {
      nestingMode: "single",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        encrypted: { valueType: "bool", optional: true },
        iops: { valueType: "number", optional: true },
        kms_key_id: { valueType: "string", optional: true },
        tags: { valueType: "map", optional: true },
        throughput: { valueType: "number", optional: true },
        volume_size: { valueType: "number", optional: true },
        volume_type: { valueType: "string", optional: true },
      },
    },
    timeouts: {
      nestingMode: "single",
      attributes: {
        create: { valueType: "string", optional: true },
        update: { valueType: "string", optional: true },
        delete: { valueType: "string", optional: true },
      },
    },
  },
};
