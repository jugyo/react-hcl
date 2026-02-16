import { attr, block, resource } from "../../dsl";
import { COMMON_RESOURCE_ATTRIBUTES, COMMON_RESOURCE_BLOCKS } from "./common";

export const awsInstanceResourceSchema = resource("aws_instance", {
  attributes: {
    ...COMMON_RESOURCE_ATTRIBUTES,
    ami: attr.string().optional().computed(),
    arn: attr.string().computed(),
    associate_public_ip_address: attr.bool().optional().computed(),
    availability_zone: attr.string().optional().computed(),
    disable_api_stop: attr.bool().optional().computed(),
    disable_api_termination: attr.bool().optional().computed(),
    ebs_optimized: attr.bool().optional().computed(),
    enable_primary_ipv6: attr.bool().optional().computed(),
    force_destroy: attr.bool().optional(),
    get_password_data: attr.bool().optional(),
    hibernation: attr.bool().optional(),
    host_id: attr.string().optional().computed(),
    host_resource_group_arn: attr.string().optional().computed(),
    iam_instance_profile: attr.string().optional().computed(),
    id: attr.string().optional().computed(),
    instance_initiated_shutdown_behavior: attr.string().optional().computed(),
    instance_lifecycle: attr.string().computed(),
    instance_state: attr.string().computed(),
    instance_type: attr.string().optional().computed(),
    ipv6_address_count: attr.number().optional().computed(),
    ipv6_addresses: attr.list().optional().computed(),
    key_name: attr.string().optional().computed(),
    monitoring: attr.bool().optional().computed(),
    outpost_arn: attr.string().computed(),
    password_data: attr.string().computed(),
    placement_group: attr.string().optional().computed(),
    placement_group_id: attr.string().optional().computed(),
    placement_partition_number: attr.number().optional().computed(),
    primary_network_interface_id: attr.string().computed(),
    private_dns: attr.string().computed(),
    private_ip: attr.string().optional().computed(),
    public_dns: attr.string().computed(),
    public_ip: attr.string().computed(),
    region: attr.string().optional().computed(),
    secondary_private_ips: attr.set().optional().computed(),
    security_groups: attr.set().optional().computed(),
    source_dest_check: attr.bool().optional(),
    spot_instance_request_id: attr.string().computed(),
    subnet_id: attr.string().optional().computed(),
    tags: attr.map().optional(),
    tags_all: attr.map().optional().computed(),
    tenancy: attr.string().optional().computed(),
    user_data: attr.string().optional(),
    user_data_base64: attr.string().optional().computed(),
    user_data_replace_on_change: attr.bool().optional(),
    volume_tags: attr.map().optional(),
    vpc_security_group_ids: attr.set().optional().computed(),
  },
  blocks: {
    ...COMMON_RESOURCE_BLOCKS,
    capacity_reservation_specification: block.single(
      {
        attributes: {
          capacity_reservation_preference: attr.string().optional(),
        },
        blocks: {
          capacity_reservation_target: block.single(
            {
              attributes: {
                capacity_reservation_id: attr.string().optional(),
                capacity_reservation_resource_group_arn: attr
                  .string()
                  .optional(),
              },
            },
            { maxItems: 1 },
          ),
        },
      },
      { maxItems: 1 },
    ),
    cpu_options: block.single(
      {
        attributes: {
          amd_sev_snp: attr.string().optional().computed(),
          core_count: attr.number().optional().computed(),
          threads_per_core: attr.number().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    credit_specification: block.single(
      {
        attributes: {
          cpu_credits: attr.string().optional(),
        },
      },
      { maxItems: 1 },
    ),
    ebs_block_device: block.set({
      attributes: {
        delete_on_termination: attr.bool().optional(),
        device_name: attr.string().required(),
        encrypted: attr.bool().optional().computed(),
        iops: attr.number().optional().computed(),
        kms_key_id: attr.string().optional().computed(),
        snapshot_id: attr.string().optional().computed(),
        tags: attr.map().optional(),
        tags_all: attr.map().optional().computed(),
        throughput: attr.number().optional().computed(),
        volume_id: attr.string().computed(),
        volume_size: attr.number().optional().computed(),
        volume_type: attr.string().optional().computed(),
      },
    }),
    enclave_options: block.single(
      {
        attributes: {
          enabled: attr.bool().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    ephemeral_block_device: block.set({
      attributes: {
        device_name: attr.string().required(),
        no_device: attr.bool().optional(),
        virtual_name: attr.string().optional(),
      },
    }),
    instance_market_options: block.single(
      {
        attributes: {
          market_type: attr.string().optional().computed(),
        },
        blocks: {
          spot_options: block.single(
            {
              attributes: {
                instance_interruption_behavior: attr
                  .string()
                  .optional()
                  .computed(),
                max_price: attr.string().optional().computed(),
                spot_instance_type: attr.string().optional().computed(),
                valid_until: attr.string().optional().computed(),
              },
            },
            { maxItems: 1 },
          ),
        },
      },
      { maxItems: 1 },
    ),
    launch_template: block.single(
      {
        attributes: {
          id: attr.string().optional().computed(),
          name: attr.string().optional().computed(),
          version: attr.string().optional(),
        },
      },
      { maxItems: 1 },
    ),
    maintenance_options: block.single(
      {
        attributes: {
          auto_recovery: attr.string().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    metadata_options: block.single(
      {
        attributes: {
          http_endpoint: attr.string().optional(),
          http_protocol_ipv6: attr.string().optional(),
          http_put_response_hop_limit: attr.number().optional().computed(),
          http_tokens: attr.string().optional().computed(),
          instance_metadata_tags: attr.string().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    network_interface: block.set({
      attributes: {
        delete_on_termination: attr.bool().optional(),
        device_index: attr.number().required(),
        network_card_index: attr.number().optional(),
        network_interface_id: attr.string().required(),
      },
    }),
    primary_network_interface: block.single(
      {
        attributes: {
          delete_on_termination: attr.bool().computed(),
          network_interface_id: attr.string().required(),
        },
      },
      { maxItems: 1 },
    ),
    private_dns_name_options: block.single(
      {
        attributes: {
          enable_resource_name_dns_a_record: attr.bool().optional().computed(),
          enable_resource_name_dns_aaaa_record: attr
            .bool()
            .optional()
            .computed(),
          hostname_type: attr.string().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    root_block_device: block.single(
      {
        attributes: {
          delete_on_termination: attr.bool().optional(),
          device_name: attr.string().computed(),
          encrypted: attr.bool().optional().computed(),
          iops: attr.number().optional().computed(),
          kms_key_id: attr.string().optional().computed(),
          tags: attr.map().optional(),
          tags_all: attr.map().optional().computed(),
          throughput: attr.number().optional().computed(),
          volume_id: attr.string().computed(),
          volume_size: attr.number().optional().computed(),
          volume_type: attr.string().optional().computed(),
        },
      },
      { maxItems: 1 },
    ),
    secondary_network_interface: block.set({
      attributes: {
        delete_on_termination: attr.bool().optional(),
        device_index: attr.number().optional(),
        interface_type: attr.string().optional(),
        mac_address: attr.string().computed(),
        network_card_index: attr.number().required(),
        private_ip_address_count: attr.number().optional(),
        private_ip_addresses: attr.list().computed(),
        secondary_interface_id: attr.string().computed(),
        secondary_network_id: attr.string().computed(),
        secondary_subnet_id: attr.string().required(),
        source_dest_check: attr.bool().computed(),
        status: attr.string().computed(),
      },
    }),
    timeouts: block.single({
      attributes: {
        create: attr.string().optional(),
        delete: attr.string().optional(),
        read: attr.string().optional(),
        update: attr.string().optional(),
      },
    }),
  },
});
