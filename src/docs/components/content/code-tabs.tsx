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
  const items = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<CodeTabProps> =>
      React.isValidElement(child) &&
      (child.type === CodeTab ||
        (typeof child.type === "function" &&
          (child.type as { displayName?: string }).displayName ===
            CodeTab.displayName)),
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
