import { resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsInstanceResourceSchema = resource("aws_instance", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    ami: { valueType: "string", optional: true, computed: true },
    arn: { valueType: "string", computed: true },
    associate_public_ip_address: {
      valueType: "bool",
      optional: true,
      computed: true,
    },
    availability_zone: { valueType: "string", optional: true, computed: true },
    disable_api_stop: { valueType: "bool", optional: true, computed: true },
    disable_api_termination: {
      valueType: "bool",
      optional: true,
      computed: true,
    },
    ebs_optimized: { valueType: "bool", optional: true, computed: true },
    enable_primary_ipv6: { valueType: "bool", optional: true, computed: true },
    force_destroy: { valueType: "bool", optional: true },
    get_password_data: { valueType: "bool", optional: true },
    hibernation: { valueType: "bool", optional: true },
    host_id: { valueType: "string", optional: true, computed: true },
    host_resource_group_arn: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    iam_instance_profile: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    id: { valueType: "string", optional: true, computed: true },
    instance_initiated_shutdown_behavior: {
      valueType: "string",
      optional: true,
      computed: true,
    },
    instance_lifecycle: { valueType: "string", computed: true },
    instance_state: { valueType: "string", computed: true },
    instance_type: { valueType: "string", optional: true, computed: true },
    ipv6_address_count: { valueType: "number", optional: true, computed: true },
    ipv6_addresses: { valueType: "list", optional: true, computed: true },
    key_name: { valueType: "string", optional: true, computed: true },
    monitoring: { valueType: "bool", optional: true, computed: true },
    outpost_arn: { valueType: "string", computed: true },
    password_data: { valueType: "string", computed: true },
    placement_group: { valueType: "string", optional: true, computed: true },
    placement_group_id: { valueType: "string", optional: true, computed: true },
    placement_partition_number: {
      valueType: "number",
      optional: true,
      computed: true,
    },
    primary_network_interface_id: { valueType: "string", computed: true },
    private_dns: { valueType: "string", computed: true },
    private_ip: { valueType: "string", optional: true, computed: true },
    public_dns: { valueType: "string", computed: true },
    public_ip: { valueType: "string", computed: true },
    region: { valueType: "string", optional: true, computed: true },
    secondary_private_ips: { valueType: "set", optional: true, computed: true },
    security_groups: { valueType: "set", optional: true, computed: true },
    source_dest_check: { valueType: "bool", optional: true },
    spot_instance_request_id: { valueType: "string", computed: true },
    subnet_id: { valueType: "string", optional: true, computed: true },
    tags: { valueType: "map", optional: true },
    tags_all: { valueType: "map", optional: true, computed: true },
    tenancy: { valueType: "string", optional: true, computed: true },
    user_data: { valueType: "string", optional: true },
    user_data_base64: { valueType: "string", optional: true, computed: true },
    user_data_replace_on_change: { valueType: "bool", optional: true },
    volume_tags: { valueType: "map", optional: true },
    vpc_security_group_ids: {
      valueType: "set",
      optional: true,
      computed: true,
    },
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    capacity_reservation_specification: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        capacity_reservation_preference: {
          valueType: "string",
          optional: true,
        },
      },
      blocks: {
        capacity_reservation_target: {
          nestingMode: "single",
          maxItems: 1,
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
      maxItems: 1,
      attributes: {
        amd_sev_snp: { valueType: "string", optional: true, computed: true },
        core_count: { valueType: "number", optional: true, computed: true },
        threads_per_core: {
          valueType: "number",
          optional: true,
          computed: true,
        },
      },
    },
    credit_specification: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        cpu_credits: { valueType: "string", optional: true },
      },
    },
    ebs_block_device: {
      nestingMode: "set",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_name: { valueType: "string", required: true },
        encrypted: { valueType: "bool", optional: true, computed: true },
        iops: { valueType: "number", optional: true, computed: true },
        kms_key_id: { valueType: "string", optional: true, computed: true },
        snapshot_id: { valueType: "string", optional: true, computed: true },
        tags: { valueType: "map", optional: true },
        tags_all: { valueType: "map", optional: true, computed: true },
        throughput: { valueType: "number", optional: true, computed: true },
        volume_id: { valueType: "string", computed: true },
        volume_size: { valueType: "number", optional: true, computed: true },
        volume_type: { valueType: "string", optional: true, computed: true },
      },
    },
    enclave_options: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        enabled: { valueType: "bool", optional: true, computed: true },
      },
    },
    ephemeral_block_device: {
      nestingMode: "set",
      attributes: {
        device_name: { valueType: "string", required: true },
        no_device: { valueType: "bool", optional: true },
        virtual_name: { valueType: "string", optional: true },
      },
    },
    instance_market_options: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        market_type: { valueType: "string", optional: true, computed: true },
      },
      blocks: {
        spot_options: {
          nestingMode: "single",
          maxItems: 1,
          attributes: {
            instance_interruption_behavior: {
              valueType: "string",
              optional: true,
              computed: true,
            },
            max_price: { valueType: "string", optional: true, computed: true },
            spot_instance_type: {
              valueType: "string",
              optional: true,
              computed: true,
            },
            valid_until: {
              valueType: "string",
              optional: true,
              computed: true,
            },
          },
        },
      },
    },
    launch_template: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        id: { valueType: "string", optional: true, computed: true },
        name: { valueType: "string", optional: true, computed: true },
        version: { valueType: "string", optional: true },
      },
    },
    maintenance_options: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        auto_recovery: { valueType: "string", optional: true, computed: true },
      },
    },
    metadata_options: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        http_endpoint: { valueType: "string", optional: true },
        http_protocol_ipv6: { valueType: "string", optional: true },
        http_put_response_hop_limit: {
          valueType: "number",
          optional: true,
          computed: true,
        },
        http_tokens: { valueType: "string", optional: true, computed: true },
        instance_metadata_tags: {
          valueType: "string",
          optional: true,
          computed: true,
        },
      },
    },
    network_interface: {
      nestingMode: "set",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_index: { valueType: "number", required: true },
        network_card_index: { valueType: "number", optional: true },
        network_interface_id: { valueType: "string", required: true },
      },
    },
    primary_network_interface: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        delete_on_termination: { valueType: "bool", computed: true },
        network_interface_id: { valueType: "string", required: true },
      },
    },
    private_dns_name_options: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        enable_resource_name_dns_a_record: {
          valueType: "bool",
          optional: true,
          computed: true,
        },
        enable_resource_name_dns_aaaa_record: {
          valueType: "bool",
          optional: true,
          computed: true,
        },
        hostname_type: { valueType: "string", optional: true, computed: true },
      },
    },
    root_block_device: {
      nestingMode: "single",
      maxItems: 1,
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_name: { valueType: "string", computed: true },
        encrypted: { valueType: "bool", optional: true, computed: true },
        iops: { valueType: "number", optional: true, computed: true },
        kms_key_id: { valueType: "string", optional: true, computed: true },
        tags: { valueType: "map", optional: true },
        tags_all: { valueType: "map", optional: true, computed: true },
        throughput: { valueType: "number", optional: true, computed: true },
        volume_id: { valueType: "string", computed: true },
        volume_size: { valueType: "number", optional: true, computed: true },
        volume_type: { valueType: "string", optional: true, computed: true },
      },
    },
    secondary_network_interface: {
      nestingMode: "set",
      attributes: {
        delete_on_termination: { valueType: "bool", optional: true },
        device_index: { valueType: "number", optional: true },
        interface_type: { valueType: "string", optional: true },
        mac_address: { valueType: "string", computed: true },
        network_card_index: { valueType: "number", required: true },
        private_ip_address_count: { valueType: "number", optional: true },
        private_ip_addresses: { valueType: "list", computed: true },
        secondary_interface_id: { valueType: "string", computed: true },
        secondary_network_id: { valueType: "string", computed: true },
        secondary_subnet_id: { valueType: "string", required: true },
        source_dest_check: { valueType: "bool", computed: true },
        status: { valueType: "string", computed: true },
      },
    },
    timeouts: {
      nestingMode: "single",
      attributes: {
        create: { valueType: "string", optional: true },
        delete: { valueType: "string", optional: true },
        read: { valueType: "string", optional: true },
        update: { valueType: "string", optional: true },
      },
    },
  },
});
