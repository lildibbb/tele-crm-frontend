"use client";

import type { Table } from "@tanstack/react-table";
import { Check, Settings2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> extends Omit<
  React.ComponentProps<typeof PopoverContent>,
  "className"
> {
  table: Table<TData>;
  disabled?: boolean;
  className?: string; // Applied to the button
  contentClassName?: string; // Applied to the popover content
}

export function DataTableViewOptions<TData>({
  table,
  disabled,
  className,
  contentClassName,
  ...props
}: DataTableViewOptionsProps<TData>) {
  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  return (
    <Popover>
      <PopoverTrigger asChild className="border-border-default">
        <Button
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          size="sm"
          className={cn("ml-auto hidden h-8 font-normal lg:flex", className)}
          disabled={disabled}
        >
          <Settings2 className="text-muted-foreground mr-1" size={14} />
          View
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-44 p-0 border-none shadow-lg rounded-xl overflow-hidden",
          contentClassName,
        )}
        {...props}
      >
        <Command>
          <CommandInput
            placeholder="Search columns..."
            className="h-9 text-xs"
          />
          <CommandList className="border-none max-h-[200px]">
            <CommandEmpty>No columns found.</CommandEmpty>
            <CommandGroup>
              {columns.map((column) => (
                <CommandItem
                  key={column.id}
                  onSelect={() =>
                    column.toggleVisibility(!column.getIsVisible())
                  }
                >
                  <span className="truncate text-text-secondary ">
                    {column.columnDef.meta?.label ?? column.id}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto size-4 shrink-0",
                      column.getIsVisible() ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
