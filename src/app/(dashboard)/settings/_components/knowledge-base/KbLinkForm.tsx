"use client";

import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { KbType } from "@/types/enums";
import { CreateKbSchema, type CreateKbInput } from "@/lib/schemas/kb.schema";
import { useCreateKbText, useUpdateKb } from "@/queries/useKbQuery";
import { toast } from "sonner";

interface KbLinkFormProps {
  /** Whether this form is editing an existing entry */
  isEditing: boolean;
  /** ID of the entry being edited (null for create) */
  editingId: string | null;
  /** Default values (populated when editing) */
  defaultValues: CreateKbInput;
  /** Callback on successful submit or cancel */
  onClose: () => void;
}

export function KbLinkForm({
  isEditing,
  editingId,
  defaultValues,
  onClose,
}: KbLinkFormProps) {
  const createTextMutation = useCreateKbText();
  const updateMutation = useUpdateKb();

  const form = useForm<CreateKbInput>({
    resolver: standardSchemaResolver(CreateKbSchema),
    defaultValues,
  });

  const onSubmit = async (data: CreateKbInput) => {
    try {
      if (isEditing && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: { title: data.title, content: data.content, url: data.url },
        });
        toast.success("Changes saved successfully");
      } else {
        await createTextMutation.mutateAsync({ ...data, type: KbType.LINK });
        toast.success("Link added");
      }
      onClose();
    } catch {
      toast.error(
        isEditing
          ? "Couldn't save your changes. Please try again."
          : "Couldn't add link. Please try again.",
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
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-text-secondary">
                URL
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://…"
                  className="font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-text-secondary">
                Description
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short description…"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            {form.formState.isSubmitting ? "Saving…" : "Save Link"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
