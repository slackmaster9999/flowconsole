"use client";

import * as React from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface CodeTabProps {
  value: string;
  label?: string;
  children?: React.ReactNode;
}

export interface CodeTabsProps
  extends React.ComponentPropsWithoutRef<typeof Tabs> {
  listClassName?: string;
  children?: React.ReactNode;
}

export function CodeTabs({
  className,
  listClassName,
  defaultValue,
  children,
  ...props
}: CodeTabsProps) {
  const hasValueProp = (props: unknown): props is { value: string } =>
    typeof (props as { value?: unknown })?.value === "string";

  const items = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<CodeTabProps> => {
      if (!React.isValidElement(child)) return false;

      const type = child.type as {
        displayName?: string;
        name?: string;
      };
      const mdxType = (child.props as { mdxType?: string }).mdxType;
      const originalType = (child.props as { originalType?: unknown })
        .originalType as { displayName?: string } | string | undefined;

      if (child.type === CodeTab) return true;
      if (
        typeof child.type === "function" &&
        type.displayName === CodeTab.displayName
      ) {
        return true;
      }
      if (mdxType === CodeTab.displayName) return true;
      if (originalType === CodeTab) return true;
      if (typeof originalType === "string") {
        return originalType === CodeTab.displayName;
      }
      if (
        typeof originalType === "object" &&
        originalType?.displayName === CodeTab.displayName
      ) {
        return true;
      }

      return hasValueProp(child.props);
    },
  );

  const initialValue = defaultValue ?? items[0]?.props.value;

  return (
    <Tabs
      defaultValue={initialValue}
      className={cn("my-6", className)}
      {...props}
    >
      <TabsList className={cn("flex flex-wrap gap-1", listClassName)}>
        {items.map((item) => (
          <TabsTrigger key={item.props.value} value={item.props.value}>
            {item.props.label ?? item.props.value}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.props.value} value={item.props.value}>
          {item.props.children}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function CodeTab({ children }: CodeTabProps) {
  return <>{children}</>;
}

CodeTab.displayName = "CodeTab";
