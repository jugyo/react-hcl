import { describe, expect, it } from "bun:test";
import { isRawHCL, serializeHCLAttributes } from "../src/hcl-serializer";
import { tf } from "../src/helpers/tf";

describe("tf helper", () => {
  describe("tf.var", () => {
    it("returns RawHCL with var.name", () => {
      const result = tf.var("environment");
      expect(isRawHCL(result)).toBe(true);
      expect(result.value).toBe("var.environment");
    });

    it("handles underscore names", () => {
      const result = tf.var("vpc_config");
      expect(result.value).toBe("var.vpc_config");
    });
  });

  describe("tf.local", () => {
    it("returns RawHCL with local.name", () => {
      const result = tf.local("common_tags");
      expect(isRawHCL(result)).toBe(true);
      expect(result.value).toBe("local.common_tags");
    });
  });

  describe("HCL serializer integration", () => {
    it("tf.var is serialized without quotes", () => {
      const result = serializeHCLAttributes({
        environment: tf.var("environment"),
      });
      expect(result).toContain("environment = var.environment");
      expect(result).not.toContain('"var.environment"');
    });

    it("tf.local is serialized without quotes", () => {
      const result = serializeHCLAttributes({ tags: tf.local("common_tags") });
      expect(result).toContain("tags = local.common_tags");
      expect(result).not.toContain('"local.common_tags"');
    });
  });
});
