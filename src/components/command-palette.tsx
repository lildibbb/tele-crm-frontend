"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SquaresFour,
  Users,
  ShieldCheck,
  Sliders,
  ChartBar,
  Crown,
  MagnifyingGlass,
  Keyboard,
  Gear,
} from "@phosphor-icons/react";
import { useT } from "@/i18n";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/types/enums";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ALL_COMMANDS = [
  {
    heading: "Navigation",
    items: [
      { href: "/", icon: SquaresFour, labelKey: "nav.commandCenter", shortcut: "G H", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
      { href: "/leads", icon: Users, labelKey: "nav.leadIntelligence", shortcut: "G L", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
      { href: "/verification", icon: ShieldCheck, labelKey: "nav.verificationQueue", shortcut: "G V", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
      { href: "/analytics", icon: ChartBar, labelKey: "nav.analytics", shortcut: "G A", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERADMIN] },
      { href: "/settings", icon: Sliders, labelKey: "nav.settings", shortcut: "G S", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF, UserRole.SUPERADMIN] },
      { href: "/admin", icon: Crown, labelKey: "nav.superAdmin", shortcut: "G D", roles: [UserRole.SUPERADMIN] },
    ],
  },
  {
    heading: "Settings",
    items: [
      { href: "/settings", icon: Gear, labelKey: "settings.botConfig", shortcut: "1", roles: [UserRole.OWNER, UserRole.ADMIN] },
      { href: "/settings/knowledge-base", icon: Gear, labelKey: "settings.knowledgeBase", shortcut: "2", roles: [UserRole.OWNER, UserRole.ADMIN] },
      { href: "/settings/commands", icon: Gear, labelKey: "settings.commands", shortcut: "3", roles: [UserRole.OWNER, UserRole.ADMIN] },
      { href: "/settings/team", icon: Gear, labelKey: "settings.team", shortcut: "4", roles: [UserRole.OWNER] },
      { href: "/settings/sessions", icon: Gear, labelKey: "settings.sessions", shortcut: "5", roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.STAFF] },
    ],
  },
];

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
  const router = useRouter();
  const t = useT();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  // Filter commands by role
  const commands = React.useMemo(() => {
    if (!role) return [];
    return ALL_COMMANDS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    })).filter((group) => group.items.length > 0);
  }, [role]);

  const runCommand = React.useCallback((command: string) => {
    setOpen(false);
    router.push(command);
  }, [router, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={t("common.search") + "..."}
        className="h-11"
      />
      <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
        <CommandEmpty className="py-6 text-center text-sm text-text-muted">
          {t("common.noResults") || "No results found."}
        </CommandEmpty>
        
        {commands.map((group, groupIndex) => (
          <CommandGroup
            key={group.heading}
            heading={group.heading}
            className="overflow-hidden p-1 text-text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted [&_[cmdk-group]]:pt-0"
          >
            {group.items.map((item, itemIndex) => (
              <CommandItem
                key={item.href}
                value={t(item.labelKey)}
                onSelect={() => runCommand(item.href)}
                className="relative flex cursor-default gap-2 select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected='true']:bg-crimson-subtle data-[selected=true]:text-crimson data-[disabled=true]:opacity-50 cursor-pointer"
              >
                <item.icon
                  size={18}
                  weight="light"
                  className="mr-2 h-4 w-4 shrink-0 text-text-secondary"
                />
                <span className="flex-1 font-medium">{t(item.labelKey)}</span>
                {item.shortcut && (
                  <CommandShortcut className="text-[10px] font-mono text-text-muted bg-elevated px-1.5 py-0.5 rounded">
                    {item.shortcut}
                  </CommandShortcut>
                )}
              </CommandItem>
            ))}
            {groupIndex < commands.length - 1 && (
              <CommandSeparator className="-mx-1 my-1 h-px bg-border-subtle" />
            )}
          </CommandGroup>
        ))}

        <CommandSeparator className="-mx-1 my-1 h-px bg-border-subtle" />
        
        <CommandGroup 
          heading="Shortcuts"
          className="overflow-hidden p-1 text-text-primary [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-text-muted"
        >
          <CommandItem className="relative flex cursor-default gap-2 select-none items-center rounded-lg px-2 py-2.5 text-sm text-text-muted">
            <Keyboard size={18} weight="light" className="mr-2 h-4 w-4 shrink-0" />
            <span className="flex-1">Press <kbd className="font-mono bg-elevated px-1.5 py-0.5 rounded text-[10px]">⌘ K</kbd> to open</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
