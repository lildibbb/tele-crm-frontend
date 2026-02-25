"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  GripVertical,
  Plus,
  Edit3,
  Trash2,
  Info,
  Save,
  PencilLine,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TelegramPreview } from "@/components/ui/telegram-preview";
import { useCommandMenuStore } from "@/store/commandMenuStore";
import {
  CreateCommandMenuSchema,
  type CreateCommandMenuInput,
} from "@/lib/schemas/commandMenu.schema";
import { toast } from "sonner";

export function CommandsTab() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<"edit" | "preview">("edit");

  const { items, isLoading, error, fetchAll, create, update, remove } =
    useCommandMenuStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const form = useForm<CreateCommandMenuInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(CreateCommandMenuSchema as any),
    defaultValues: {
      command: "",
      label: "",
      description: "",
      content: { text: "" },
      order: 0,
    },
  });

  const textContent = (form.watch("content")?.text as string) ?? "";

  const onSubmit = async (data: CreateCommandMenuInput) => {
    try {
      if (editId) {
        await update(editId, {
          label: data.label,
          description: data.description,
          content: data.content,
        });
        toast.success("Command updated");
      } else {
        await create({ ...data, order: items.length });
        toast.success("Command created");
      }
      setDrawerOpen(false);
      setEditId(null);
      form.reset();
      await fetchAll();
    } catch {
      toast.error("Failed to save command");
    }
  };

  const openAdd = () => {
    setEditId(null);
    form.reset({
      command: "",
      label: "",
      description: "",
      content: { text: "" },
      order: items.length,
    });
    setDrawerOpen(true);
  };

  const openEdit = (cmd: (typeof items)[number]) => {
    setEditId(cmd.id);
    form.reset({
      command: cmd.command,
      label: cmd.label,
      description: cmd.description ?? "",
      content: cmd.content,
      order: cmd.order,
    });
    setDrawerOpen(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await update(id, { isActive: !isActive });
      await fetchAll();
    } catch {
      toast.error("Failed to update command");
    }
  };

  const deleteCommand = async (id: string) => {
    try {
      await remove(id);
      toast.success("Command deleted");
      await fetchAll();
    } catch {
      toast.error("Failed to delete command");
    }
  };

  return (
    <div className="space-y-5 animate-in-up relative">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">
            Telegram Command Menu
          </h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Drag to reorder how commands appear in the Telegram bot menu
          </p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5 flex-shrink-0">
          <Plus className="h-4 w-4" /> Add Command
        </Button>
      </div>
      {/* Info banner */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-info/10 border border-info/20">
        <Info className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
        <p className="text-xs font-sans text-info">
          Changes sync to Telegram automatically on save.
        </p>
      </div>
      {/* Command list */}
      <div className="bg-elevated rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[32px_48px_160px_1fr_200px_80px_88px] gap-4 px-4 py-3 bg-elevated/50 border-b border-border-subtle min-w-[700px]">
            {[
              "",
              "#",
              "Command",
              "Label / Description",
              "Content Preview",
              "Active",
              "",
            ].map((h) => (
              <p
                key={h}
                className="text-[11px] font-sans font-medium text-text-secondary uppercase tracking-wider"
              >
                {h}
              </p>
            ))}
          </div>

          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded" />
              ))}
            </div>
          ) : (
            items.map((cmd, i) => (
              <div
                key={cmd.id}
                className="grid grid-cols-[32px_48px_160px_1fr_200px_80px_88px] gap-4 items-center px-4 py-4 border-b border-border-subtle/50 hover:bg-elevated/30 transition-colors group min-w-[700px]"
              >
                <GripVertical className="h-4 w-4 text-text-muted cursor-grab active:cursor-grabbing" />
                <span className="data-mono text-center">{i + 1}</span>
                <span className="font-mono text-sm font-medium text-crimson">
                  /{cmd.command}
                </span>
                <div className="min-w-0">
                  <p className="font-sans font-medium text-[13px] text-text-primary">
                    {cmd.label}
                  </p>
                  <p className="font-sans text-xs text-text-secondary truncate">
                    {cmd.description}
                  </p>
                </div>
                <p className="font-sans text-xs text-text-muted truncate">
                  {typeof cmd.content?.text === "string"
                    ? (cmd.content.text as string).slice(0, 60) + "…"
                    : JSON.stringify(cmd.content).slice(0, 60)}
                </p>
                <div>
                  <Switch
                    checked={cmd.isActive}
                    onCheckedChange={() => toggleActive(cmd.id, cmd.isActive)}
                    size="sm"
                  />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEdit(cmd)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => deleteCommand(cmd.id)}
                    className="text-text-muted hover:text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}

          {!isLoading && items.length === 0 && (
            <div className="py-16 text-center min-w-[700px]">
              <p className="font-sans text-sm text-text-secondary">
                No commands yet.
              </p>
              <Button
                variant="link"
                onClick={openAdd}
                className="text-crimson mt-2"
              >
                Add your first command →
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Slide-out drawer */}
      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDrawerOpen(false);
            setEditId(null);
            setActivePane("edit");
            form.reset();
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[640px] lg:max-w-[920px] flex flex-col p-0"
        >
          {/* Header: title + mobile edit/preview toggle */}
          <SheetHeader className="px-6 py-4 border-b border-border-subtle flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="font-bold text-xl text-text-primary">
                {editId ? "Edit Command" : "New Command"}
              </SheetTitle>
              {/* Edit/Preview pill — visible only on < lg */}
              <div className="lg:hidden flex items-center gap-0.5 bg-elevated p-1 rounded-xl flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePane("edit")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activePane === "edit"
                      ? "bg-card text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  <PencilLine className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActivePane("preview")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    activePane === "preview"
                      ? "bg-card text-text-primary shadow-sm"
                      : "text-text-muted hover:text-text-secondary",
                  )}
                >
                  <Eye className="h-3.5 w-3.5" /> Preview
                </button>
              </div>
            </div>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* ── Two-column body ── */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Left / Edit pane */}
                <div
                  className={cn(
                    "flex-1 flex flex-col overflow-hidden",
                    activePane === "preview" ? "hidden lg:flex" : "flex",
                  )}
                >
                  {/* Compact metadata strip */}
                  <div className="px-6 pt-5 pb-3 flex-shrink-0 space-y-3 border-b border-border-subtle/50">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="command"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-text-secondary">
                              Command Slug
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. register"
                                className="font-mono text-sm h-8"
                                disabled={!!editId}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs text-text-secondary">
                              Button Label
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Shown in Telegram menu"
                                className="h-8"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs text-text-secondary">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Internal note (not visible to users)"
                              className="h-8"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Editor fills remaining space */}
                  <div className="flex flex-col flex-1 overflow-hidden px-6 py-4">
                    <div className="flex-shrink-0 mb-2">
                      <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
                        Message Content
                      </p>
                      <p className="text-[11px] font-sans text-text-muted mt-0.5">
                        What the bot sends when this command is triggered
                      </p>
                    </div>
                    <RichTextEditor
                      value={textContent}
                      onChange={(val) =>
                        form.setValue("content", { text: val })
                      }
                      placeholder="Enter the message content…"
                      fillHeight
                    />
                  </div>
                </div>

                {/* Right / Preview pane */}
                <div
                  className={cn(
                    "lg:w-[280px] lg:flex-shrink-0 lg:border-l border-border-subtle bg-card/40 flex-col overflow-y-auto",
                    activePane === "edit" ? "hidden lg:flex" : "flex px-6 py-5 lg:px-4 lg:py-4",
                  )}
                >
                  <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider mb-3">
                    Live Preview
                  </p>
                  <TelegramPreview markdown={textContent} />
                </div>
              </div>

              {/* ── Footer buttons ── */}
              <div className="flex gap-3 px-6 py-5 border-t border-border-subtle flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setDrawerOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 gap-2"
                  disabled={form.formState.isSubmitting}
                >
                  <Save className="h-4 w-4" />{" "}
                  {form.formState.isSubmitting ? "Saving…" : "Save Command"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
