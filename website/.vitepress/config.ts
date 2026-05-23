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
      { text: "Design", link: "/design/overview" },
      { text: "Contributing", link: "/contributing/development" },
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/getting-started" },
          { text: "Concepts", link: "/guide/concepts" },
          { text: "Terraform Workflow", link: "/guide/terraform-workflow" },
        ],
      },
      {
        text: "Reference",
        items: [
          { text: "CLI", link: "/reference/cli" },
          { text: "Components", link: "/reference/components" },
          { text: "Hooks", link: "/reference/hooks" },
          { text: "Helpers", link: "/reference/helpers" },
          { text: "Init", link: "/reference/init" },
        ],
      },
      {
        text: "Examples",
        items: [{ text: "Overview", link: "/examples/" }],
      },
      {
        text: "Design",
        items: [
          { text: "Overview", link: "/design/overview" },
          { text: "Constraints", link: "/design/constraints" },
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
