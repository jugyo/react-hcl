interface ConvertedExpression {
  code: string;
  needsTf: boolean;
}

export interface ConvertedProp {
  code: string;
  needsTf: boolean;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIdentifier(value: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value);
}

function objectKey(key: string): string {
  return isIdentifier(key) ? key : JSON.stringify(key);
}

function unwrapInterpolation(value: string): string | null {
  const match = value.match(/^\$\{([\s\S]+)\}$/);
  return match ? match[1] : null;
}

function toExpression(
  value: unknown,
  allowBlockArray: boolean,
): ConvertedExpression {
  if (typeof value === "string") {
    const expression = unwrapInterpolation(value);
    if (expression !== null) {
      return { code: `tf.raw(${JSON.stringify(expression)})`, needsTf: true };
    }
    return { code: JSON.stringify(value), needsTf: false };
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return { code: String(value), needsTf: false };
  }

  if (value === null) {
    return { code: "null", needsTf: false };
  }

  if (Array.isArray(value)) {
    if (allowBlockArray && value.every((item) => isPlainObject(item))) {
      if (value.length === 1) {
        const nested = toExpression(value[0], false);
        return {
          code: `tf.block(${nested.code})`,
          needsTf: true,
        };
      }

      const blockItems = value.map((item) => {
        const nested = toExpression(item, false);
        return { code: `tf.block(${nested.code})`, needsTf: true };
      });
      return {
        code: `[${blockItems.map((item) => item.code).join(", ")}]`,
        needsTf: true,
      };
    }

    const items = value.map((item) => toExpression(item, false));
    return {
      code: `[${items.map((item) => item.code).join(", ")}]`,
      needsTf: items.some((item) => item.needsTf),
    };
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value).map(([key, entryValue]) => {
      const converted = toExpression(entryValue, false);
      return {
        code: `${objectKey(key)}: ${converted.code}`,
        needsTf: converted.needsTf,
      };
    });
    return {
      code: `{ ${entries.map((entry) => entry.code).join(", ")} }`,
      needsTf: entries.some((entry) => entry.needsTf),
    };
  }

  return { code: JSON.stringify(value), needsTf: false };
}

export function convertPropToJsx(
  propName: string,
  value: unknown,
  options?: { forceStringForVariableType?: boolean },
): ConvertedProp {
  if (options?.forceStringForVariableType && typeof value === "string") {
    const expression = unwrapInterpolation(value);
    const typeValue = expression ?? value;
    return {
      code: `${propName}=${JSON.stringify(typeValue)}`,
      needsTf: false,
    };
  }

  if (typeof value === "string") {
    const expression = unwrapInterpolation(value);
    if (expression !== null) {
      return {
        code: `${propName}={tf.raw(${JSON.stringify(expression)})}`,
        needsTf: true,
      };
    }

    return { code: `${propName}=${JSON.stringify(value)}`, needsTf: false };
  }

  const converted = toExpression(value, true);
  return {
    code: `${propName}={${converted.code}}`,
    needsTf: converted.needsTf,
  };
}

export function convertObjectLiteral(
  value: Record<string, any>,
): ConvertedExpression {
  return toExpression(value, true);
}
