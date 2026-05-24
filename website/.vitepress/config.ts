import { defineConfig } from "vitepress";

export default defineConfig({
  title: "react-hcl",
  description: "JSX/TSX to Terraform HCL transpiler",
  base: "/react-hcl/",
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/cli" },
      { text: "Examples", link: "/examples/" },
      { text: "Contributing", link: "/contributing/development" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Concepts", link: "/guide/concepts" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI Reference", link: "/reference/cli" },
          { text: "Component Reference", link: "/reference/components" },
          { text: "useRef Hook", link: "/reference/hooks" },
          { text: "Terraform Helpers", link: "/reference/helpers" },
          { text: "react-hcl init", link: "/reference/init" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Overview", link: "/examples/" },
          { text: "Module Composition", link: "/examples/module-composition" },
          { text: "Static Website", link: "/examples/static-website" },
          { text: "ECS Fargate", link: "/examples/ecs-fargate" },
          { text: "VPC Network", link: "/examples/vpc-network" },
        ],
      },
      {
        text: "Contributing",
        items: [{ text: "Development", link: "/contributing/development" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/jugyo/react-hcl" },
    ],
  },
});
