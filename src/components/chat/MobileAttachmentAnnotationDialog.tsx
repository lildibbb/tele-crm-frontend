"use client";

import AttachmentAnnotationDialog, {
  type AttachmentAnnotationDialogProps,
} from "@/components/chat/AttachmentAnnotationDialog";

type MobileAttachmentAnnotationDialogProps = Omit<
  AttachmentAnnotationDialogProps,
  "layout"
>;

export default function MobileAttachmentAnnotationDialog(
  props: MobileAttachmentAnnotationDialogProps,
) {
  return <AttachmentAnnotationDialog {...props} layout="mobile" />;
}
