"use client";

import React, { useState } from "react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useDocumentCategoryTemplates,
  useCreateDocumentCategoryTemplate,
  useUpdateDocumentCategoryTemplate,
  useDeleteDocumentCategoryTemplate,
} from "@/hooks/useDocumentCategoryTemplates";
import { useAuth } from "@/hooks/useAuth";
import {
  DOCUMENT_CATEGORY_TEMPLATE_COLORS,
  type DocumentCategoryTemplate,
  type DocumentCategoryTemplateColor,
} from "@/types/api";
import { Palette, Plus, Trash2, Pencil, Loader2, Check } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

/** Swatch styling for the four brand colors this feature is scoped to (see Things-to-work-on.md:
 * "the primary colors are green, yellow, blue and orange"). */
const COLOR_SWATCHES: Record<
  DocumentCategoryTemplateColor,
  { label: string; swatchClass: string; badgeClass: string }
> = {
  green: {
    label: "Green",
    swatchClass: "bg-green-500",
    badgeClass: "bg-green-100 text-green-700",
  },
  yellow: {
    label: "Yellow",
    swatchClass: "bg-yellow-400",
    badgeClass: "bg-yellow-100 text-yellow-700",
  },
  blue: { label: "Blue", swatchClass: "bg-blue-500", badgeClass: "bg-blue-100 text-blue-700" },
  orange: {
    label: "Orange",
    swatchClass: "bg-orange-500",
    badgeClass: "bg-orange-100 text-orange-700",
  },
};

const emptyForm = () => ({
  name: "",
  color: "green" as DocumentCategoryTemplateColor,
  header_text: "",
  description: "",
});

interface CategoryTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mirrors CategoryAdminSheet's (assets module) interaction shape: one Sheet that toggles
 * between a list view and a create/edit form view, rather than separate dialogs. */
export function CategoryTemplateSheet({ open, onOpenChange }: CategoryTemplateSheetProps) {
  const { roles } = useAuth();
  const canManage = roles.includes("hr") || roles.includes("admin");

  const { data: templates, isLoading } = useDocumentCategoryTemplates();
  const createTemplate = useCreateDocumentCategoryTemplate();
  const updateTemplate = useUpdateDocumentCategoryTemplate();
  const deleteTemplate = useDeleteDocumentCategoryTemplate();

  const [editingTemplate, setEditingTemplate] = useState<DocumentCategoryTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const isSaving = createTemplate.isPending || updateTemplate.isPending;
  const list = templates ?? [];

  const startCreate = () => {
    setEditingTemplate(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const startEdit = (template: DocumentCategoryTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      color: template.color,
      header_text: template.header_text ?? "",
      description: template.description ?? "",
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setForm(emptyForm());
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.danger("Name is required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      color: form.color,
      header_text: form.header_text.trim() || undefined,
      description: form.description.trim() || undefined,
    };
    try {
      if (editingTemplate) {
        await updateTemplate.mutateAsync({ id: editingTemplate.id, payload });
        toast.success("Category template updated");
      } else {
        await createTemplate.mutateAsync(payload);
        toast.success("Category template created");
      }
      cancelForm();
    } catch {
      // Global mutation error handler shows the toast.
    }
  };

  const handleDelete = async (template: DocumentCategoryTemplate) => {
    if (!confirm(`Delete the "${template.name}" template?`)) return;
    try {
      await deleteTemplate.mutateAsync(template.id);
      toast.success("Category template deleted");
    } catch {
      // Global mutation error handler shows the toast.
    }
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Document Category Templates"
      description="Design how documents in a category should look"
      maxWidth="w-[40%]"
      footer={
        !canManage ? undefined : showForm ? (
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={cancelForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
              onClick={handleSubmit}
              disabled={isSaving}
              data-testid="save-category-template"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        ) : (
          <Button
            className="w-full bg-brand-accent hover:bg-brand-accent/90"
            onClick={startCreate}
            data-testid="new-category-template"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Category Template
          </Button>
        )
      }
    >
      <div className="p-6 space-y-4">
        {showForm ? (
          <div className="space-y-4" data-testid="category-template-form">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Onboarding Materials"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Color *</Label>
              <div className="flex gap-3" role="radiogroup" aria-label="Template color">
                {DOCUMENT_CATEGORY_TEMPLATE_COLORS.map((color) => {
                  const swatch = COLOR_SWATCHES[color];
                  const selected = form.color === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={swatch.label}
                      data-testid={`color-swatch-${color}`}
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      className={cn(
                        "relative h-10 w-10 rounded-full ring-offset-2 transition-all",
                        swatch.swatchClass,
                        selected ? "ring-2 ring-slate-900" : "ring-1 ring-transparent",
                      )}
                    >
                      {selected && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Header Text</Label>
              <Input
                value={form.header_text}
                onChange={(e) => setForm((f) => ({ ...f, header_text: e.target.value }))}
                placeholder="Optional — shown at the top of documents in this category"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional notes about this template"
                rows={3}
              />
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Palette className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-sm text-muted-foreground">No category templates yet.</p>
          </div>
        ) : (
          <div className="space-y-2" data-testid="category-template-list">
            {list.map((template) => {
              const swatch = COLOR_SWATCHES[template.color];
              return (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                  data-testid={`category-template-row-${template.name}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn("h-6 w-6 rounded-full shrink-0", swatch.swatchClass)}
                      aria-hidden
                    />
                    <div>
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className={cn("text-xs rounded px-1.5 inline-block", swatch.badgeClass)}>
                        {swatch.label}
                      </div>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(template)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(template)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ReusableSheet>
  );
}

/** Self-contained entry point: owns its own open state so the Documents page's Categories tab
 * only needs to render this one component (a button that opens the Sheet above). */
export function CategoryTemplateEntryPoint() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} data-testid="design-template-entry">
        <Palette className="h-4 w-4 mr-1.5" />
        Design Template
      </Button>
      <CategoryTemplateSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
