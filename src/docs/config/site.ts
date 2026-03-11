import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "FlowConsole",
  description:
    "Get your project off to an explosive start with FlowConsole! Harness the power of Next.js 14, Prisma, Neon, Auth.js v5, Resend, React Email, Shadcn/ui and Stripe to build your next big thing.",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "https://x.com/flowconsole",
    github: "https://github.com/slackmaster9999/flowconsole",
  }
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Project",
    items: [
      { title: "Changelog", href: "#" }
    ],
  },
  {
    title: "Docs",
    items: [
      { title: "Introduction", href: "#" },
      { title: "Installation", href: "#" },
      { title: "Components", href: "#" },
      { title: "Fluent API", href: "#" }
    ],
  },
];
