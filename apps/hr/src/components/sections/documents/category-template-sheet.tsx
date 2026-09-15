"use client";

import React, { useRef, useState } from "react";

import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDocumentCategoryTemplates,
  useCreateDocumentCategoryTemplate,
  useUpdateDocumentCategoryTemplate,
  useDeleteDocumentCategoryTemplate,
} from "@/hooks/useDocumentCategoryTemplates";
import { useAuth } from "@/hooks/useAuth";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_TEMPLATE_COLORS,
  type DocumentCategory,
  type DocumentCategoryTemplate,
  type DocumentCategoryTemplateColor,
  type DocumentCategoryTemplateBorderStyle,
  type DocumentCategoryTemplateLogoPosition,
} from "@/types/api";
import { Palette, Plus, Trash2, Pencil, Loader2, Check, Upload, X } from "lucide-react";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { DocumentBrandingPreview } from "@/components/sections/documents/document-branding-preview";
import {
  DEFAULT_TITLE_COLOR,
  isValidTitleColor,
  isValidLogoUrl,
  readFileAsDataUrl,
} from "@/lib/helpers/document-branding";

/** Radix Select rejects an empty-string item value, so "no category" (universal) needs a
 *  non-empty sentinel translated back to `null` at the state boundary. */
const UNIVERSAL_CATEGORY = "__universal__";

const BORDER_STYLE_OPTIONS: { value: DocumentCategoryTemplateBorderStyle; label: string }[] = [
  { value: "NONE", label: "No border" },
  { value: "SIMPLE", label: "Simple line" },
  { value: "DOUBLE", label: "Double line" },
  { value: "ACCENT", label: "Accent border" },
];

const LOGO_POSITION_OPTIONS: { value: DocumentCategoryTemplateLogoPosition; label: string }[] = [
  { value: "TOP_LEFT", label: "Top left" },
  { value: "BOTTOM_LEFT", label: "Bottom left" },
];

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
  category: null as DocumentCategory | null,
  header_text: "",
  description: "",
  titleColor: DEFAULT_TITLE_COLOR,
  borderStyle: "NONE" as DocumentCategoryTemplateBorderStyle,
  logoUrl: "",
  logoPosition: "TOP_LEFT" as DocumentCategoryTemplateLogoPosition,
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

  const logoFileInputRef = useRef<HTMLInputElement>(null);

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
      category: template.category ?? null,
      header_text: template.header_text ?? "",
      description: template.description ?? "",
      titleColor: template.titleColor || DEFAULT_TITLE_COLOR,
      borderStyle: template.borderStyle ?? "NONE",
      logoUrl: template.logoUrl ?? "",
      logoPosition: template.logoPosition ?? "TOP_LEFT",
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
    if (!isValidTitleColor(form.titleColor)) {
      toast.danger("Title color must be a hex color like #1a1a1a");
      return;
    }
    if (form.logoUrl.trim() && !isValidLogoUrl(form.logoUrl.trim())) {
      toast.danger("Logo URL must be an absolute https:// URL or a data: URI");
      return;
    }
    const payload = {
      name: form.name.trim(),
      color: form.color,
      category: form.category,
      header_text: form.header_text.trim() || undefined,
      description: form.description.trim() || undefined,
      titleColor: form.titleColor,
      borderStyle: form.borderStyle,
      logoUrl: form.logoUrl.trim(),
      logoPosition: form.logoPosition,
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

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((f) => ({ ...f, logoUrl: dataUrl }));
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Failed to read the logo file");
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
              <Label>Category</Label>
              <Select
                value={form.category ?? UNIVERSAL_CATEGORY}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    category: v === UNIVERSAL_CATEGORY ? null : (v as DocumentCategory),
                  }))
                }
              >
                <SelectTrigger data-testid="template-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNIVERSAL_CATEGORY}>Any category (universal)</SelectItem>
                  {DOCUMENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                Which document category offers this template when creating a new document. Universal
                templates are offered for every category.
              </p>
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

            <div className="space-y-4 border-t pt-4">
              <p className="text-xs font-bold uppercase text-slate-400">Branding</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title-color-input">Title color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="title-color-input"
                      type="color"
                      className="h-9 w-12 p-1"
                      value={
                        isValidTitleColor(form.titleColor) ? form.titleColor : DEFAULT_TITLE_COLOR
                      }
                      onChange={(e) => setForm((f) => ({ ...f, titleColor: e.target.value }))}
                      data-testid="title-color-input"
                    />
                    <Input
                      value={form.titleColor}
                      onChange={(e) => setForm((f) => ({ ...f, titleColor: e.target.value }))}
                      placeholder={DEFAULT_TITLE_COLOR}
                      className="flex-1"
                      data-testid="title-color-text"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Border layout</Label>
                  <Select
                    value={form.borderStyle}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        borderStyle: v as DocumentCategoryTemplateBorderStyle,
                      }))
                    }
                  >
                    <SelectTrigger data-testid="border-style-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BORDER_STYLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <div
                    onClick={() => logoFileInputRef.current?.click()}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50"
                    data-testid="logo-file-dropzone"
                  >
                    {form.logoUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary data:/https: source, not a Next static asset */}
                        <img
                          src={form.logoUrl}
                          alt="Logo preview"
                          className="h-6 w-6 shrink-0 rounded object-contain"
                        />
                        <span className="truncate">Logo selected — click to replace</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setForm((f) => ({ ...f, logoUrl: "" }));
                          }}
                          className="ml-auto shrink-0 text-slate-400 hover:text-red-500"
                          aria-label="Remove logo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 shrink-0" />
                        <span>Upload a logo image…</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoFileChange}
                    data-testid="logo-file-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Logo position</Label>
                  <Select
                    value={form.logoPosition}
                    onValueChange={(v) =>
                      setForm((f) => ({
                        ...f,
                        logoPosition: v as DocumentCategoryTemplateLogoPosition,
                      }))
                    }
                  >
                    <SelectTrigger data-testid="logo-position-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOGO_POSITION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Preview</Label>
                <DocumentBrandingPreview
                  headerText={form.header_text || form.name}
                  titleColor={form.titleColor}
                  borderStyle={form.borderStyle}
                  logoUrl={form.logoUrl}
                  logoPosition={form.logoPosition}
                />
              </div>
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
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("text-xs rounded px-1.5 inline-block", swatch.badgeClass)}
                        >
                          {swatch.label}
                        </span>
                        <span className="text-xs text-slate-400">
                          {template.category ?? "Universal"}
                        </span>
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
