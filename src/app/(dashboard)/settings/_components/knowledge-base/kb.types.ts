import type { KbEntry } from "@/lib/schemas/kb.schema";

// ── Modal tab types ──────────────────────────────────────────────────────────

export type ModalTab = "text" | "upload" | "link";

// ── Component prop interfaces ────────────────────────────────────────────────

export interface KbEntryCardProps {
  /** The KB entry data to render */
  entry: KbEntry;
  /** Index for staggered animation delay */
  index: number;
  /** Callback when user clicks the edit button */
  onEdit: (entry: KbEntry) => void;
  /** Callback when user clicks the delete button */
  onDelete: (id: string) => void;
  /** Callback when user toggles the active switch */
  onToggleActive: (id: string, currentlyActive: boolean) => void;
  /** Callback when user clicks retry on failed entry */
  onRetry: (id: string) => void;
  /** Whether retry is currently running for this entry */
  isRetrying: boolean;
}

export interface KbUploadZoneProps {
  /** The selected file (or null) */
  file: File | null;
  /** Title input value */
  title: string;
  /** Whether a drag is in progress over the zone */
  isDragging: boolean;
  /** Whether the upload is in progress */
  isLoading: boolean;
  /** Whether backend accepted upload and processing started */
  isAccepted: boolean;
  /** Callback when a file is selected via input or drag-drop */
  onFileChange: (file: File | null) => void;
  /** Callback when drag state changes */
  onDragChange: (dragging: boolean) => void;
  /** Callback when title input changes */
  onTitleChange: (title: string) => void;
  /** Callback to trigger the upload */
  onUpload: () => void;
  /** Callback to cancel and close */
  onCancel: () => void;
}

export interface KbTextFormProps {
  /** Whether this form is in edit mode */
  isEditing: boolean;
  /** Callback when form is submitted or cancelled */
  onClose: () => void;
}

export interface KbLinkFormProps {
  /** Whether this form is in edit mode */
  isEditing: boolean;
  /** Callback when form is submitted or cancelled */
  onClose: () => void;
}

export interface KbAddEditDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback to close the dialog */
  onClose: () => void;
  /** The entry being edited (null for create mode) */
  editingEntry: KbEntry | null;
  /** Callback fired after upload creates a KB entry */
  onUploadCreated?: (entry: KbEntry) => void;
}
