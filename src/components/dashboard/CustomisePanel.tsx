"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sliders,
  DotsSixVertical,
  ChartBar,
  GitBranch,
  Lightning,
  TrendUp,
  ArrowCounterClockwise,
} from "@phosphor-icons/react";
import {
  useDashboardLayoutStore,
  type DashboardWidget,
  type WidgetId,
} from "@/store/dashboardLayoutStore";

// ── Icon map per widget ───────────────────────────────────────────────────────
const WIDGET_ICONS: Record<WidgetId, React.ElementType> = {
  "kpi-cards": ChartBar,
  "funnel-activity": GitBranch,
  "action-strip": Lightning,
  "trend-charts": TrendUp,
};

// ── Sortable row ──────────────────────────────────────────────────────────────
function SortableWidgetRow({ widget }: { widget: DashboardWidget }) {
  const { toggleWidget } = useDashboardLayoutStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: widget.id });

  const Icon = WIDGET_ICONS[widget.id];
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isDragging ? "bg-elevated shadow-lg" : "hover:bg-void/40"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary p-0.5 touch-none flex-shrink-0"
        aria-label="Drag to reorder"
      >
        <DotsSixVertical size={16} weight="bold" />
      </button>

      {/* Icon + label */}
      <Icon
        size={16}
        weight="duotone"
        className={widget.visible ? "text-primary" : "text-text-muted"}
      />
      <span
        className={`flex-1 text-[13px] font-sans font-medium transition-colors ${
          widget.visible ? "text-text-primary" : "text-text-muted"
        }`}
      >
        {widget.label}
      </span>

      {/* Visibility toggle */}
      <Switch
        checked={widget.visible}
        onCheckedChange={() => toggleWidget(widget.id)}
        aria-label={`Toggle ${widget.label}`}
      />
    </div>
  );
}

// ── Trigger button (exported for use in dashboard header) ─────────────────────
export function CustomisePanelTrigger() {
  const [open, setOpen] = useState(false);
  const { widgets, reorderWidgets, resetToDefault } = useDashboardLayoutStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sortedWidgets = [...widgets].sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedWidgets.findIndex((w) => w.id === active.id);
    const newIndex = sortedWidgets.findIndex((w) => w.id === over.id);
    const reordered = arrayMove(sortedWidgets, oldIndex, newIndex);
    reorderWidgets(reordered.map((w) => w.id));
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 hover:bg-white/20 hover:text-white/90 h-[30px] px-3 rounded-md text-xs font-medium transition-colors"
        aria-label="Customise dashboard"
      >
        <Sliders size={13} weight="bold" />
        Customise
      </button>

      {/* Sheet panel */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[320px] sm:w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border-subtle">
            <SheetTitle className="text-[15px] font-semibold text-text-primary flex items-center gap-2">
              <Sliders size={16} weight="duotone" className="text-primary" />
              Customise Dashboard
            </SheetTitle>
            <SheetDescription className="text-xs text-text-muted mt-0.5">
              Drag to reorder · toggle to show/hide
            </SheetDescription>
          </SheetHeader>

          {/* Sortable widget list */}
          <div className="flex-1 overflow-y-auto py-2 px-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedWidgets.map((w) => w.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-0.5">
                  {sortedWidgets.map((widget) => (
                    <SortableWidgetRow key={widget.id} widget={widget} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border-subtle">
            <Separator className="mb-4" />
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-text-muted hover:text-text-primary text-xs"
              onClick={resetToDefault}
            >
              <ArrowCounterClockwise size={13} weight="bold" />
              Reset to Default
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
