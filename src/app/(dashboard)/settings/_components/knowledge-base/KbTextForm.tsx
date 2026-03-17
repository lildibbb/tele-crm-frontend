"use client";

import { useState } from "react";
import { PencilLine, Eye } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { TelegramPreview } from "@/components/ui/telegram-preview";
import { cn } from "@/lib/utils";
import { KbType } from "@/types/enums";
import { CreateKbSchema, type CreateKbInput } from "@/lib/schemas/kb.schema";
import { useCreateKbText, useUpdateKb } from "@/queries/useKbQuery";
import { toast } from "sonner";

interface KbTextFormProps {
  /** Whether this form is editing an existing entry */
  isEditing: boolean;
  /** ID of the entry being edited (null for create) */
  editingId: string | null;
  /** Default values (populated when editing) */
  defaultValues: CreateKbInput;
  /** Callback on successful submit or cancel */
  onClose: () => void;
}

export function KbTextForm({
  isEditing,
  editingId,
  defaultValues,
  onClose,
}: KbTextFormProps) {
  const [pane, setPane] = useState<"edit" | "preview">("edit");
  const createTextMutation = useCreateKbText();
  const updateMutation = useUpdateKb();

  const form = useForm<CreateKbInput>({
    resolver: standardSchemaResolver(CreateKbSchema),
    defaultValues,
  });

  const contentValue = useWatch({ control: form.control, name: "content" });

  const onSubmit = async (data: CreateKbInput) => {
    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: { title: data.title, content: data.content, url: data.url },
        });
        toast.success("Changes saved successfully");
      } else {
        await createTextMutation.mutateAsync(data);
        toast.success("New content added");
      }
      onClose();
    } catch {
      toast.error(
        isEditing
          ? "Couldn't save your changes. Please try again."
          : "Couldn't add content. Please try again.",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-text-secondary">
                Title
              </FormLabel>
              <FormControl>
                <Input placeholder="Entry title…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Edit/Preview toggle — visible only on mobile */}
        <div className="sm:hidden flex items-center gap-0.5 bg-elevated p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setPane("edit")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              pane === "edit"
                ? "bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            <PencilLine className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => setPane("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              pane === "preview"
                ? "bg-card text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary",
            )}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>

        {/* Split-panel: editor + preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem
                className={cn(pane === "preview" ? "hidden sm:block" : "block")}
              >
                <FormLabel className="text-xs font-medium text-text-secondary">
                  Content
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Paste your guide, FAQ, or template here…"
                    minHeight={240}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className={cn(
              "space-y-2",
              pane === "edit" ? "hidden sm:block" : "block",
            )}
          >
            <p className="text-xs font-medium text-text-secondary">
              Telegram Preview
            </p>
            <TelegramPreview markdown={contentValue ?? ""} />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Saving…"
              : isEditing
                ? "Update Content"
                : "Save Content"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
