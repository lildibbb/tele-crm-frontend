"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
  type TabsTriggerProps,
} from "@/components/ui/motion-tabs";

export interface AnimatedTabItem {
  /** Display label for the tab */
  label: string;
  /** Unique value for the tab */
  value: string;
  /** Optional href for link-based tabs (if not provided, acts as a clickable tab) */
  href?: string;
  /** Optional icon component */
  icon?: React.ReactNode;
  /** Content to display when tab is active */
  content?: React.ReactNode;
}

export interface AnimatedTabsProps {
  /** Array of tab items */
  tabs: AnimatedTabItem[];
  /** Default active tab value */
  defaultValue?: string;
  /** Controlled value - if provided, component is controlled */
  value?: string;
  /** Callback when value changes (controlled mode) */
  onValueChange?: (value: string) => void;
  /** Additional className for the tabs container */
  className?: string;
  /** Additional className for the tabs list */
  listClassName?: string;
  /** Whether to use links instead of clickable tabs */
  useLinks?: boolean;
  /** Use settings-style navigation (horizontal scroll with underline) */
  variant?: "default" | "settings";
}

function TabTrigger({
  tab,
  isActive,
  useLinks,
  className,
  variant,
  ...props
}: Omit<TabsTriggerProps, "value" | "children"> & {
  tab: AnimatedTabItem;
  isActive: boolean;
  useLinks?: boolean;
  variant?: "default" | "settings";
}) {
  const triggerContent = (
    <>
      {tab.icon && <span className="mr-2">{tab.icon}</span>}
      {tab.label}
    </>
  );

  // Settings variant uses simple navigation style
  if (variant === "settings" && tab.href) {
    return (
      <Link
        href={tab.href}
        className={`settings-tab ${isActive ? "active" : ""}`}
      >
        {tab.icon && <span className="mr-1.5">{tab.icon}</span>}
        {tab.label}
      </Link>
    );
  }

  if (useLinks && tab.href) {
    return (
      <TabsTrigger value={tab.value} className={className} {...props}>
        <Link
          href={tab.href}
          className="cursor-pointer w-full h-full flex items-center justify-center"
        >
          {triggerContent}
        </Link>
      </TabsTrigger>
    );
  }

  return (
    <TabsTrigger value={tab.value} className={className} {...props}>
      {triggerContent}
    </TabsTrigger>
  );
}

export function AnimatedTabs({
  tabs,
  defaultValue,
  value,
  onValueChange,
  className,
  listClassName,
  useLinks = false,
  variant = "default",
}: AnimatedTabsProps) {
  const pathname = usePathname();

  // If using links, determine active tab from pathname
  const linkDefaultValue = useLinks
    ? (tabs.find((tab) => tab.href && pathname === tab.href)?.value ??
      tabs[0]?.value)
    : (defaultValue ?? tabs[0]?.value);

  // Settings variant uses simple navigation without animations
  if (variant === "settings") {
    return (
      <div
        className={`flex items-center gap-0 border-b border-border-subtle overflow-x-auto ${className || ""}`}
      >
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.value}
            tab={tab}
            isActive={pathname === tab.href}
            useLinks={useLinks}
            variant="settings"
          />
        ))}
      </div>
    );
  }

  const isControlled = value !== undefined;

  return (
    <Tabs
      {...(isControlled
        ? { value, onValueChange }
        : { defaultValue: linkDefaultValue })}
      className={className}
    >
      <TabsList className={listClassName}>
        {tabs.map((tab) => (
          <TabTrigger
            key={tab.value}
            tab={tab}
            isActive={
              value
                ? value === tab.value
                : useLinks
                  ? pathname === tab.href
                  : linkDefaultValue === tab.value
            }
            useLinks={useLinks}
          />
        ))}
      </TabsList>

      <TabsContents>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {tab.content}
          </TabsContent>
        ))}
      </TabsContents>
    </Tabs>
  );
}

/**
 * @deprecated Use AnimatedTabs with variant="settings" instead
 */
export function AnimatedSettingsTabs({
  tabs,
  className,
}: {
  tabs: AnimatedTabItem[];
  className?: string;
}) {
  return (
    <AnimatedTabs
      tabs={tabs}
      useLinks
      variant="settings"
      className={className}
    />
  );
}
