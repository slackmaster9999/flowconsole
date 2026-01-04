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
      title: "How to try it?",
      items: [
        {
          title: "Playground",
          href: "https://dev.flowconsole.pages.dev/?utm_source=docs-sidebar",
        }
      ],
    },
    {
      title: "FlowConsole API",
      items: [
        {
          title: "API Reference",
          href: "/docs/config/api-reference",
        }
      ],
    },
    {
      title: "Examples",
      items: [
        {
          title: "Retail Banking",
          href: "/docs/examples/retail-banking",
        },
        {
          title: "Global ERP & Supply Chain",
          href: "/docs/examples/global-erp-supply-chain"
        },
        {
          title: "OSS Collaboration Platform",
          href: "/docs/examples/oss-collaboration-platform"
        },
        {
          title: "Global Media Streaming Platform'",
          href: "/docs/examples/global-media-streaming-platform"
        },
        {
          title: "Open-Source Observability Stack",
          href: "/docs/examples/open-source-observability-stack"
        },
      ],
    },
  ],
};
