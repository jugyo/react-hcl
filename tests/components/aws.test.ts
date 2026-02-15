import { describe, expect, it } from "bun:test";
import {
  Aws,
  AwsRouteTableAssociation,
  AwsS3BucketPublicAccessBlock,
  AwsVpc,
} from "../../src/resources/aws";

describe("AWS resource components", () => {
  it("Aws namespace exposes resource wrappers", () => {
    const block = Aws.Vpc({
      name: "main",
      cidr_block: "10.0.0.0/16",
    });

    expect(block).toEqual({
      blockType: "resource",
      type: "aws_vpc",
      name: "main",
      attributes: { cidr_block: "10.0.0.0/16" },
    });
  });

  it("individual wrappers map to the same resource types", () => {
    const block = AwsVpc({
      name: "main",
      cidr_block: "10.0.0.0/16",
      tags: { Name: "main" },
    });

    expect(block.type).toBe("aws_vpc");
    expect(block.attributes.tags).toEqual({ Name: "main" });
  });

  it("supports route table association for subnet", () => {
    const block = AwsRouteTableAssociation({
      name: "public",
      route_table_id: "aws_route_table.public.id",
      subnet_id: "aws_subnet.public.id",
    });

    expect(block.type).toBe("aws_route_table_association");
    expect(block.attributes).toEqual({
      route_table_id: "aws_route_table.public.id",
      subnet_id: "aws_subnet.public.id",
    });
  });

  it("keeps required public-access settings for S3 block", () => {
    const block = AwsS3BucketPublicAccessBlock({
      name: "site_access",
      bucket: "aws_s3_bucket.site.id",
      block_public_acls: true,
      block_public_policy: true,
      ignore_public_acls: true,
      restrict_public_buckets: true,
    });

    expect(block.type).toBe("aws_s3_bucket_public_access_block");
    expect(block.attributes.block_public_policy).toBe(true);
  });
});
