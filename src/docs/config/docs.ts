import { DocsConfig } from "types";

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    }
  ],
  sidebarNav: [
    {
      title: "Getting Started",
      items: [
        {
          title: "Introduction",
          href: "/docs",
        },
        {
          title: "Tutorial",
          href: "/docs/tutorial"
        },
      ],
    },
    {
      title: "FlowConsole",
      items: [
        {
          title: "Fluent API",
          href: "/docs/config/fluent-api",
        },
        {
          title: "Examples",
          href: "/docs/config/examples"
        }
      ],
    },
  ],
};
