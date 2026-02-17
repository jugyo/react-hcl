import type { ReverseBlock } from "./normalize";
import { convertObjectLiteral, convertPropToJsx } from "./value-converter";

interface GenerateTsxOptions {
  moduleOutput: boolean;
}

interface GeneratedElement {
  jsx: string;
  needsTf: boolean;
  componentName: string;
}

function isValidJsxPropName(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

function formatElement(componentName: string, props: string[]): string {
  if (props.length === 0) {
    return `<${componentName} />`;
  }

  return [`<${componentName}`, ...props.map((prop) => `  ${prop}`), "/>"].join(
    "\n",
  );
}

function generateElement(block: ReverseBlock): GeneratedElement {
  const props: string[] = [];
  const fallbackProps: Record<string, any> = {};
  let needsTf = false;

  const pushProp = (
    name: string,
    value: unknown,
    forceVariableType = false,
  ) => {
    const converted = convertPropToJsx(name, value, {
      forceStringForVariableType: forceVariableType,
    });
    props.push(converted.code);
    needsTf ||= converted.needsTf;
  };

  const pushAttrs = (allowHclFallback: boolean, forceVariableType = false) => {
    for (const [key, value] of Object.entries(block.attributes)) {
      if (isValidJsxPropName(key)) {
        pushProp(key, value, forceVariableType && key === "type");
      } else if (allowHclFallback) {
        fallbackProps[key] = value;
      } else {
        throw new Error(`Unsupported prop name for ${block.blockType}: ${key}`);
      }
    }

    if (allowHclFallback && Object.keys(fallbackProps).length > 0) {
      const converted = convertObjectLiteral(fallbackProps);
      props.push(`__hcl={${converted.code}}`);
      needsTf ||= converted.needsTf;
    }
  };

  if (block.blockType === "resource") {
    pushProp("type", block.type ?? "");
    pushProp("label", block.label ?? "");
    pushAttrs(true);
    return {
      jsx: formatElement("Resource", props),
      needsTf,
      componentName: "Resource",
    };
  }

  if (block.blockType === "data") {
    pushProp("type", block.type ?? "");
    pushProp("label", block.label ?? "");
    pushAttrs(true);
    return {
      jsx: formatElement("Data", props),
      needsTf,
      componentName: "Data",
    };
  }

  if (block.blockType === "module") {
    pushProp("label", block.label ?? "");
    pushAttrs(true);
    return {
      jsx: formatElement("Module", props),
      needsTf,
      componentName: "Module",
    };
  }

  if (block.blockType === "provider") {
    pushProp("type", block.type ?? "");
    pushAttrs(false);
    return {
      jsx: formatElement("Provider", props),
      needsTf,
      componentName: "Provider",
    };
  }

  if (block.blockType === "variable") {
    pushProp("label", block.label ?? "");
    pushAttrs(false, true);
    return {
      jsx: formatElement("Variable", props),
      needsTf,
      componentName: "Variable",
    };
  }

  if (block.blockType === "output") {
    pushProp("label", block.label ?? "");
    pushAttrs(false);
    return {
      jsx: formatElement("Output", props),
      needsTf,
      componentName: "Output",
    };
  }

  if (block.blockType === "locals") {
    pushAttrs(false);
    return {
      jsx: formatElement("Locals", props),
      needsTf,
      componentName: "Locals",
    };
  }

  pushAttrs(false);
  return {
    jsx: formatElement("Terraform", props),
    needsTf,
    componentName: "Terraform",
  };
}

function indent(text: string, spaces: number): string {
  const padding = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line.length > 0 ? `${padding}${line}` : line))
    .join("\n");
}

function buildDefaultOutput(elements: string[]): string {
  return elements.join("\n");
}

function buildModuleReturnExpression(elements: string[]): string {
  if (elements.length === 1) {
    return elements[0];
  }
  return [
    "[",
    ...elements.map((element) => `${indent(element, 2)},`),
    "]",
  ].join("\n");
}

export function generateTsxFromBlocks(
  blocks: ReverseBlock[],
  options: GenerateTsxOptions,
): string {
  const generated = blocks.map((block) => generateElement(block));
  const needsTf = generated.some((item) => item.needsTf);
  const elements = generated.map((item) => item.jsx);

  if (!options.moduleOutput) {
    return `${buildDefaultOutput(elements)}\n`;
  }

  const components = Array.from(
    new Set(generated.map((item) => item.componentName)),
  ).sort();
  const imports = needsTf ? [...components, "tf"] : components;
  const moduleReturnExpression = buildModuleReturnExpression(elements);

  return [
    `import { ${imports.join(", ")} } from "react-hcl";`,
    "",
    "export default function Main() {",
    "  return (",
    indent(moduleReturnExpression, 4),
    "  );",
    "}",
    "",
  ].join("\n");
}
