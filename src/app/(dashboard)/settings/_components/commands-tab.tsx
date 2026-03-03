"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Edit3,
  Trash2,
  Save,
  PencilLine,
  Eye,
  Menu,
  Keyboard,
  Terminal,
  Power,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  TelegramPreview,
  extractPlainText,
} from "@/components/ui/telegram-preview";
import { useCommandMenuStore } from "@/store/commandMenuStore";
import {
  CreateCommandMenuSchema,
  EMPTY_TIPTAP_DOC,
  type CreateCommandMenuInput,
  type CommandMenu,
  type TiptapDoc,
} from "@/lib/schemas/commandMenu.schema";
import { toast } from "sonner";
import { useMaintenanceConfig } from "@/queries/useMaintenanceQuery";
import { FeatureDisabledBanner } from "@/components/maintenance/FeatureDisabledBanner";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Check if content is legacy { text: string } format */
function isLegacyContent(
  content: Record<string, unknown>,
): content is { text: string } {
  return typeof content?.text === "string" && !content?.type;
}

/** Normalize content to Tiptap JSON */
function normalizeContent(content: Record<string, unknown>): TiptapDoc {
  if (isLegacyContent(content)) {
    // Migrate legacy text to Tiptap doc
    const text = content.text;
    if (!text.trim()) return EMPTY_TIPTAP_DOC;
    return {
      type: "doc",
      content: text.split("\n").map((line: string) => ({
        type: "paragraph",
        ...(line.trim() ? { content: [{ type: "text", text: line }] } : {}),
      })),
    };
  }
  if (content?.type === "doc") return content as unknown as TiptapDoc;
  return EMPTY_TIPTAP_DOC;
}

/** Get a plain text preview from content (handles both legacy and Tiptap JSON) */
function getContentPreview(
  content: Record<string, unknown>,
  maxLen = 80,
): string {
  if (isLegacyContent(content)) {
    const t = content.text.trim();
    return t.length > maxLen ? t.slice(0, maxLen) + "..." : t;
  }
  const plain = extractPlainText(content).trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "..." : plain;
}

// ── Sortable Command Row ──────────────────────────────────────────────────────

interface SortableCommandRowProps {
  cmd: CommandMenu;
  index: number;
  onEdit: (cmd: CommandMenu) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  onToggleShowInMenu: (id: string, current: boolean) => void;
  onToggleShowInKeyboard: (id: string, current: boolean) => void;
}

function SortableCommandRow({
  cmd,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleShowInMenu,
  onToggleShowInKeyboard,
}: SortableCommandRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cmd.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative grid grid-cols-[40px_32px_140px_1fr_80px_80px_80px_60px] xl:grid-cols-[40px_32px_140px_1fr_200px_80px_80px_80px_60px] items-center gap-4 px-5 py-3 border-b border-border-subtle/50 transition-all",
        isDragging
          ? "bg-elevated/80 shadow-md z-50 border border-crimson/20"
          : "hover:bg-elevated/40",
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="flex items-center justify-center cursor-grab active:cursor-grabbing touch-none p-1.5 rounded-md hover:bg-elevated transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-text-muted/70 group-hover:text-text-muted" />
      </button>

      {/* Order badge */}
      <span className="text-center text-[12px] font-sans font-medium text-text-muted/70">
        {index + 1}
      </span>

      {/* Command slug */}
      <span className="font-mono text-[13px] font-medium text-text-primary truncate">
        /{cmd.command}
      </span>

      {/* Label & description */}
      <div className="flex flex-col min-w-0 pr-4">
        <p className="font-sans font-medium text-[13px] text-text-primary truncate">
          {cmd.label}
        </p>
        {cmd.description && (
          <p className="font-sans text-[12px] text-text-muted truncate mt-0.5">
            {cmd.description}
          </p>
        )}
      </div>

      {/* Content preview */}
      <p className="hidden xl:block text-[12px] text-text-muted font-sans truncate pr-4">
        {getContentPreview(cmd.content)}
      </p>

      {/* Visibility toggles */}
      <TooltipProvider delayDuration={300}>
        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Menu className="h-3 w-3 text-text-muted" />
                <Switch
                  checked={cmd.showInMenu}
                  onCheckedChange={() =>
                    onToggleShowInMenu(cmd.id, cmd.showInMenu)
                  }
                  size="sm"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Show in Telegram menu
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Keyboard className="h-3 w-3 text-text-muted" />
                <Switch
                  checked={cmd.showInKeyboard}
                  onCheckedChange={() =>
                    onToggleShowInKeyboard(cmd.id, cmd.showInKeyboard)
                  }
                  size="sm"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Show as keyboard button
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <Power className="h-3 w-3 text-text-muted" />
                <Switch
                  checked={cmd.isActive}
                  onCheckedChange={() => onToggleActive(cmd.id, cmd.isActive)}
                  size="sm"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Active / Inactive
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onEdit(cmd)}
          className="text-text-muted hover:text-text-primary"
        >
          <Edit3 className="h-3.5 w-3.5" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-text-muted hover:text-danger hover:bg-danger/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete command</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the{" "}
                <span className="font-mono text-crimson">/{cmd.command}</span>{" "}
                command. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(cmd.id)}
                className="bg-danger text-white hover:bg-danger/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CommandsTab() {
  const { data: maintenanceConfig } = useMaintenanceConfig();
  const commandMenuEnabled = maintenanceConfig?.featureFlags.commandMenu ?? true;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<"edit" | "preview">("edit");
  // Track current Tiptap JSON for live preview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveContent, setLiveContent] =
    useState<Record<string, any>>(EMPTY_TIPTAP_DOC);
  const isSubmittingRef = useRef(false);

  const { items, isLoading, error, fetchAll, create, update, remove, reorder } =
    useCommandMenuStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // ── Form ──────────────────────────────────────────────────────────────────

  const form = useForm<CreateCommandMenuInput>({
    // Zod v4 schemas require `as any` due to type mismatch with @hookform/resolvers
    resolver: zodResolver(CreateCommandMenuSchema as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: {
      command: "",
      label: "",
      description: "",
      content: EMPTY_TIPTAP_DOC,
      order: 0,
      showInMenu: true,
      showInKeyboard: false,
    },
  });

  const onSubmit = async (data: CreateCommandMenuInput) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      if (editId) {
        await update(editId, {
          label: data.label,
          description: data.description,
          content: data.content,
          showInMenu: data.showInMenu,
          showInKeyboard: data.showInKeyboard,
        });
        toast.success("Command saved");
      } else {
        await create({ ...data, order: items.length });
        toast.success("New command created");
      }
      setDrawerOpen(false);
      setEditId(null);
      setActivePane("edit");
      form.reset();
      setLiveContent(EMPTY_TIPTAP_DOC);
      await fetchAll();
    } catch {
      toast.error("Couldn't save this command. Please try again.");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // ── Drawer open handlers ──────────────────────────────────────────────────

  const openAdd = () => {
    setEditId(null);
    const defaults = {
      command: "",
      label: "",
      description: "",
      content: EMPTY_TIPTAP_DOC,
      order: items.length,
      showInMenu: true,
      showInKeyboard: false,
    };
    form.reset(defaults);
    setLiveContent(EMPTY_TIPTAP_DOC);
    setActivePane("edit");
    setDrawerOpen(true);
  };

  const openEdit = (cmd: CommandMenu) => {
    setEditId(cmd.id);
    const normalized = normalizeContent(cmd.content);
    const vals = {
      command: cmd.command,
      label: cmd.label,
      description: cmd.description ?? "",
      content: normalized,
      order: cmd.order,
      showInMenu: cmd.showInMenu ?? true,
      showInKeyboard: cmd.showInKeyboard ?? false,
    };
    form.reset(vals);
    setLiveContent(normalized);
    setActivePane("edit");
    setDrawerOpen(true);
  };

  // ── Inline toggles ───────────────────────────────────────────────────────

  const toggleField = useCallback(
    async (id: string, field: string, current: boolean) => {
      try {
        await update(id, { [field]: !current });
        await fetchAll();
      } catch {
        toast.error(`Couldn't update ${field}. Please try again.`);
      }
    },
    [update, fetchAll],
  );

  const toggleActive = useCallback(
    (id: string, isActive: boolean) => toggleField(id, "isActive", isActive),
    [toggleField],
  );

  const toggleShowInMenu = useCallback(
    (id: string, current: boolean) => toggleField(id, "showInMenu", current),
    [toggleField],
  );

  const toggleShowInKeyboard = useCallback(
    (id: string, current: boolean) =>
      toggleField(id, "showInKeyboard", current),
    [toggleField],
  );

  const deleteCommand = useCallback(
    async (id: string) => {
      try {
        await remove(id);
        toast.success("Command removed");
        await fetchAll();
      } catch {
        toast.error("Couldn't delete this command. Please try again.");
      }
    },
    [remove, fetchAll],
  );

  // ── DnD handlers ──────────────────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      // Build new order map
      const reordered = [...items];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);

      const orderItems = reordered.map((item, idx) => ({
        id: item.id,
        order: idx,
      }));

      try {
        await reorder({ items: orderItems });
        toast.success("Order saved");
      } catch {
        toast.error("Couldn't reorder. Please try again.");
      }
    },
    [items, reorder],
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-in-up relative">
      {!commandMenuEnabled && (
        <FeatureDisabledBanner feature="Command Menus" />
      )}
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Command Menu</h2>
          <p className="text-text-secondary text-sm font-sans mt-1">
            Manage bot commands, reorder by dragging, and configure visibility
          </p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-1.5 flex-shrink-0">
          <Plus className="h-4 w-4" /> Add Command
        </Button>
      </div>

      {/* Column header */}
      <div className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[40px_32px_140px_1fr_80px_80px_80px_60px] xl:grid-cols-[40px_32px_140px_1fr_200px_80px_80px_80px_60px] gap-4 px-5 py-3 bg-elevated border-b border-border-subtle min-w-[800px]">
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider text-center" />
            <span className="text-[11px] font-sans font-medium text-text-muted/70 uppercase tracking-wider text-center">
              #
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider">
              Command
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider">
              Label
            </span>
            <span className="hidden xl:block text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider">
              Content
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider text-center">
              Menu
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider text-center">
              Keyboard
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider text-center">
              Active
            </span>
            <span className="text-[11px] font-sans font-medium text-text-muted uppercase tracking-wider" />
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="p-4 space-y-3 min-w-[800px]">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-14 rounded-lg bg-border-subtle/50"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty state */
            <div className="py-24 flex flex-col items-center justify-center min-w-[800px]">
              <div className="w-16 h-16 rounded-2xl bg-elevated border border-border-subtle flex items-center justify-center mb-5 shadow-sm">
                <Terminal className="h-7 w-7 text-text-muted" />
              </div>
              <p className="font-sans text-sm font-medium text-text-primary mb-1.5">
                No commands configured
              </p>
              <p className="font-sans text-[13px] text-text-secondary mb-6 max-w-[320px] text-center leading-relaxed">
                Create your first command to define how the bot responds to user
                interactions in Telegram.
              </p>
              <Button onClick={openAdd} size="sm" className="gap-1.5 shadow-sm">
                <Plus className="h-4 w-4" /> Create Command
              </Button>
            </div>
          ) : (
            /* Sortable command list */
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="min-w-[800px] divide-y divide-border-subtle bg-background">
                  <AnimatePresence mode="popLayout">
                    {items.map((cmd, i) => (
                      <SortableCommandRow
                        key={cmd.id}
                        cmd={cmd}
                        index={i}
                        onEdit={openEdit}
                        onDelete={deleteCommand}
                        onToggleActive={toggleActive}
                        onToggleShowInMenu={toggleShowInMenu}
                        onToggleShowInKeyboard={toggleShowInKeyboard}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* ── Slide-out drawer ── */}
      <Sheet
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDrawerOpen(false);
            setEditId(null);
            setActivePane("edit");
            form.reset();
            setLiveContent(EMPTY_TIPTAP_DOC);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[680px] lg:max-w-[960px] flex flex-col p-0"
        >
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b border-border-subtle flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <SheetTitle className="font-bold text-xl text-text-primary">
                {editId ? "Edit Command" : "New Command"}
              </SheetTitle>
              {/* Mobile-only edit/preview pill */}
              <div className="sm:hidden flex items-center gap-0.5 bg-elevated p-1 rounded-xl flex-shrink-0">
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
              <div className="flex flex-col sm:flex-row flex-1 overflow-hidden">
                {/* Left / Edit pane */}
                <div
                  className={cn(
                    "flex-1 flex flex-col overflow-hidden",
                    activePane === "preview" ? "hidden sm:flex" : "flex",
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

                    {/* Visibility toggles */}
                    <div className="grid grid-cols-2 gap-3">
                      <Controller
                        control={form.control}
                        name="showInMenu"
                        render={({ field }) => (
                          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-elevated/50">
                            <div className="flex items-center gap-2">
                              <Menu className="h-3.5 w-3.5 text-text-muted" />
                              <span className="text-xs font-sans text-text-secondary">
                                Show in menu
                              </span>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              size="sm"
                            />
                          </div>
                        )}
                      />
                      <Controller
                        control={form.control}
                        name="showInKeyboard"
                        render={({ field }) => (
                          <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-elevated/50">
                            <div className="flex items-center gap-2">
                              <Keyboard className="h-3.5 w-3.5 text-text-muted" />
                              <span className="text-xs font-sans text-text-secondary">
                                Keyboard button
                              </span>
                            </div>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              size="sm"
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  {/* Editor fills remaining space */}
                  <div className="flex flex-col flex-1 overflow-hidden px-6 py-4">
                    <div className="flex-shrink-0 mb-2">
                      <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
                        Message Content
                      </p>
                      <p className="text-[11px] font-sans text-text-muted mt-0.5">
                        Rich text sent when this command is triggered
                      </p>
                    </div>
                    <Controller
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <RichTextEditor
                          mode="json"
                          jsonContent={field.value as TiptapDoc}
                          onJsonChange={(json) => {
                            field.onChange(json);
                            setLiveContent(json);
                          }}
                          placeholder="Enter the message content..."
                          fillHeight
                        />
                      )}
                    />
                  </div>
                </div>

                {/* Right / Preview pane — always visible on sm+ */}
                <div
                  className={cn(
                    "sm:w-[240px] lg:w-[280px] sm:flex-shrink-0 border-transparent flex-col overflow-y-auto",
                    activePane === "edit" ? "hidden sm:flex" : "flex",
                  )}
                >
                  <div className="px-4 py-4 space-y-4">
                    {/* Preview label */}
                    <p className="text-[11px] font-sans font-semibold text-text-secondary uppercase tracking-wider">
                      Live Preview
                    </p>

                    <TelegramPreview tiptapJson={liveContent} />

                    {/* Meta preview */}
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-sans font-semibold text-text-muted uppercase tracking-wider">
                        Command Info
                      </p>
                      <div className="bg-elevated/50 rounded-lg p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted font-sans">
                            Slug
                          </span>
                          <span className="text-[11px] text-crimson font-mono">
                            /{form.watch("command") || "---"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted font-sans">
                            Label
                          </span>
                          <span className="text-[11px] text-text-primary font-sans truncate max-w-[140px]">
                            {form.watch("label") || "---"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted font-sans">
                            Menu
                          </span>
                          <span className="text-[11px] text-text-secondary font-sans">
                            {form.watch("showInMenu") ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-text-muted font-sans">
                            Keyboard
                          </span>
                          <span className="text-[11px] text-text-secondary font-sans">
                            {form.watch("showInKeyboard")
                              ? "Visible"
                              : "Hidden"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  {form.formState.isSubmitting ? "Saving..." : "Save Command"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
