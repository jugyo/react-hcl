import { attr, block, data } from "../../dsl";

export const awsAmiDataSchema = data("aws_ami", {
  attributes: {
    allow_unsafe_filter: attr.bool().optional(),
    architecture: attr.string().computed(),
    arn: attr.string().computed(),
    boot_mode: attr.string().computed(),
    creation_date: attr.string().computed(),
    deprecation_time: attr.string().computed(),
    description: attr.string().computed(),
    ena_support: attr.bool().computed(),
    executable_users: attr.list().optional(),
    hypervisor: attr.string().computed(),
    id: attr.string().optional().computed(),
    image_id: attr.string().computed(),
    image_location: attr.string().computed(),
    image_owner_alias: attr.string().computed(),
    image_type: attr.string().computed(),
    imds_support: attr.string().computed(),
    include_deprecated: attr.bool().optional(),
    kernel_id: attr.string().computed(),
    last_launched_time: attr.string().computed(),
    most_recent: attr.bool().optional(),
    name: attr.string().computed(),
    name_regex: attr.string().optional(),
    owner_id: attr.string().computed(),
    owners: attr.list().optional(),
    platform: attr.string().computed(),
    platform_details: attr.string().computed(),
    public: attr.bool().computed(),
    ramdisk_id: attr.string().computed(),
    region: attr.string().optional().computed(),
    root_device_name: attr.string().computed(),
    root_device_type: attr.string().computed(),
    root_snapshot_id: attr.string().computed(),
    sriov_net_support: attr.string().computed(),
    state: attr.string().computed(),
    state_reason: attr.map().computed(),
    tags: attr.map().optional().computed(),
    tpm_support: attr.string().computed(),
    uefi_data: attr.string().optional(),
    usage_operation: attr.string().computed(),
    virtualization_type: attr.string().computed(),
  },
  blocks: {
    block_device_mappings: block.set({
      attributes: {
        device_name: attr.string().optional(),
        ebs: attr.map().optional(),
        no_device: attr.string().optional(),
        virtual_name: attr.string().optional(),
      },
    }),
    filter: block.set({
      attributes: {
        name: attr.string().required(),
        values: attr.set().required(),
      },
    }),
    product_codes: block.set({
      attributes: {
        product_code_id: attr.string().optional(),
        product_code_type: attr.string().optional(),
      },
    }),
    timeouts: block.single({
      attributes: {
        read: attr.string().optional(),
      },
    }),
  },
});
