"use client";
import MaxWidthWrapper from "@/components/shared/max-width-wrapper";
import { HeaderSection } from "../shared/header-section";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import { Icons } from "../shared/icons";
import { cn } from "@/lib/utils";
import { ArchitectureDiagram } from "flowconsole/components/ArchitectureDiagram";
import { ThemeProvider } from "flowconsole/theme/ThemeProvider";
import { architectureNodeTypes, architectureEdgeTypes } from "flowconsole/diagram/registry";
import { useTheme } from "next-themes";
import "@/styles/preview-landing.css";


export default function PreviewLanding() {
  const {theme, setTheme} = useTheme();
  return (
    <div className="preview-landing pb-6 sm:pb-16">
      <MaxWidthWrapper className="max-w-8xl">
        <HeaderSection
          title="See it in action"
          subtitle="Write architecture like code. See diagrams appear instantly."
        />
        <div className="rounded-xl md:bg-muted/30 gap-3 md:p-3.5 md:ring-1 md:ring-inset md:ring-border">
          <div className="relative aspect-video overflow-hidden rounded-xl border md:rounded-lg">
            <ThemeProvider>
              <ArchitectureDiagram
              model={{
  "nodes": [
    {
      "id": "cloud-banking",
      "position": {
        "x": 0,
        "y": 0
      },
      "type": "container",
      "data": {
        "title": "Cloud Banking",
        "expanded": true
      }
    },
    {
      "id": "data-store",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "cloud-banking",
      "type": "container",
      "data": {
        "title": "Data Store",
        "expanded": true
      }
    },
    {
      "id": "core-services",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "cloud-banking",
      "type": "container",
      "data": {
        "title": "Core Services",
        "expanded": true
      }
    },
    {
      "id": "customer",
      "position": {
        "x": 0,
        "y": 0
      },
      "type": "element",
      "data": {
        "title": "Customer",
        "description": "Retail banking customer",
        "tone": "primary",
        "shape": "person"
      }
    },
    {
      "id": "customer-dashboard",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "cloud-banking",
      "type": "element",
      "data": {
        "title": "Customer Dashboard",
        "description": "Browser Single-page Application",
        "shape": "service"
      }
    },
    {
      "id": "authentication",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "core-services",
      "type": "element",
      "data": {
        "title": "Authentication",
        "description": "Self-Hosted Authentication Service",
        "shape": "service"
      }
    },
    {
      "id": "accounts-api",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "core-services",
      "type": "element",
      "data": {
        "title": "Accounts API",
        "description": "Java Spring service for balances and payments",
        "shape": "service"
      }
    },
    {
      "id": "session-cache",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "data-store",
      "type": "element",
      "data": {
        "title": "Session Cache",
        "description": "Stores customer session payloads",
        "tone": "muted",
        "shape": "database"
      }
    },
    {
      "id": "ledger-db",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "data-store",
      "type": "element",
      "data": {
        "title": "Ledger DB",
        "description": "Persistent customer and transaction data",
        "tone": "muted",
        "shape": "database"
      }
    },
    {
      "id": "audit-events",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "core-services",
      "type": "element",
      "data": {
        "title": "Audit Events",
        "description": "Every request produces an audit record",
        "tone": "warning",
        "shape": "queue"
      }
    },
    {
      "id": "fraud-guard",
      "position": {
        "x": 0,
        "y": 0
      },
      "parentId": "core-services",
      "type": "element",
      "data": {
        "title": "Fraud Guard",
        "description": "3rd-party fraud scoring",
        "tone": "muted",
        "shape": "service"
      }
    }
  ],
  "edges": [
    {
      "id": "rel-1",
      "type": "relationship",
      "source": "customer",
      "target": "customer-dashboard",
      "data": {
        "label": "launch app",
        "kind": "sync"
      }
    },
    {
      "id": "rel-2",
      "type": "relationship",
      "source": "customer-dashboard",
      "target": "authentication",
      "data": {
        "label": "login",
        "kind": "sync"
      }
    },
    {
      "id": "rel-3",
      "type": "relationship",
      "source": "customer-dashboard",
      "target": "accounts-api",
      "data": {
        "label": "load dashboard",
        "kind": "sync"
      }
    },
    {
      "id": "rel-4",
      "type": "relationship",
      "source": "accounts-api",
      "target": "session-cache",
      "data": {
        "label": "session context",
        "kind": "dependency"
      }
    },
    {
      "id": "rel-5",
      "type": "relationship",
      "source": "accounts-api",
      "target": "ledger-db",
      "data": {
        "label": "account snapshot",
        "kind": "dependency"
      }
    },
    {
      "id": "rel-6",
      "type": "relationship",
      "source": "accounts-api",
      "target": "authentication",
      "data": {
        "label": "validate token",
        "kind": "sync"
      }
    },
    {
      "id": "rel-7",
      "type": "relationship",
      "source": "accounts-api",
      "target": "audit-events",
      "data": {
        "label": "emit audit",
        "kind": "event"
      }
    },
    {
      "id": "rel-8",
      "type": "relationship",
      "source": "accounts-api",
      "target": "fraud-guard",
      "data": {
        "label": "score transaction",
        "kind": "async"
      }
    }
  ],
  "flows": [
    {
      "id": "flow-1",
      "name": "launch app",
      "steps": [
        {
          "id": "flow-1-step-1",
          "edgeId": "rel-1",
          "sourceId": "customer",
          "targetId": "customer-dashboard",
          "label": "launch app"
        },
        {
          "id": "flow-1-step-2",
          "edgeId": "rel-2",
          "sourceId": "customer-dashboard",
          "targetId": "authentication",
          "label": "login"
        },
        {
          "id": "flow-1-step-3",
          "edgeId": "rel-3",
          "sourceId": "customer-dashboard",
          "targetId": "accounts-api",
          "label": "load dashboard"
        },
        {
          "id": "flow-1-step-4",
          "edgeId": "rel-4",
          "sourceId": "accounts-api",
          "targetId": "session-cache",
          "label": "session context"
        },
        {
          "id": "flow-1-step-5",
          "edgeId": "rel-5",
          "sourceId": "accounts-api",
          "targetId": "ledger-db",
          "label": "account snapshot"
        },
        {
          "id": "flow-1-step-6",
          "edgeId": "rel-6",
          "sourceId": "accounts-api",
          "targetId": "authentication",
          "label": "validate token"
        },
        {
          "id": "flow-1-step-7",
          "edgeId": "rel-7",
          "sourceId": "accounts-api",
          "targetId": "audit-events",
          "label": "emit audit"
        },
        {
          "id": "flow-1-step-8",
          "edgeId": "rel-8",
          "sourceId": "accounts-api",
          "targetId": "fraud-guard",
          "label": "score transaction"
        }
      ]
    }
  ]
}}
              nodeTypes={architectureNodeTypes}
              edgeTypes={architectureEdgeTypes}
              editable={true}
              themeControls={{resolvedScheme: theme === "dark" ? "dark" : "light",
                              scheme: theme === "dark" ? "dark" : "light",
                              toggleScheme: () => {}}}
            />
            </ThemeProvider>
          </div>
        </div>
        <div
          className="flex justify-center space-x-2 md:space-x-4 mt-8"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          <Link
            href="https://dev.flowconsole.pages.dev/"
            prefetch={true}
            className={cn(
              buttonVariants({ size: "lg", rounded: "full" }),
              "gap-2",
            )}
          >
            <span>Go to Playground</span>
            <Icons.arrowRight className="size-4" />
          </Link>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
