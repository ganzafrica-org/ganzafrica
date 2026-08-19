"use client";

import React, { useState } from "react";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAssetCategories,
  useCreateAssetCategory,
  useUpdateAssetCategory,
  useDeactivateAssetCategory,
} from "@/hooks/useAssets";
import type { AssetCategory, SpecFieldDefinition, SpecFieldType } from "@/types/api";
import { Plus, Trash2, Pencil, Loader2, X } from "lucide-react";
import { toast } from "@/lib/toast";

interface CategoryAdminSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyField = (): SpecFieldDefinition => ({
  key: "",
  label: "",
  type: "text",
  required: false,
});

const emptyForm = () => ({
  name: "",
  parent_name: "",
  slug: "",
  sort_order: "",
  spec_schema: [] as SpecFieldDefinition[],
});

export function CategoryAdminSheet({ open, onOpenChange }: CategoryAdminSheetProps) {
  const { categories, grouped, isLoading } = useAssetCategories();
  const createCategory = useCreateAssetCategory();
  const updateCategory = useUpdateAssetCategory();
  const deactivateCategory = useDeactivateAssetCategory();

  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());

  const isSaving = createCategory.isPending || updateCategory.isPending;

  const startCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const startEdit = (cat: AssetCategory) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      parent_name: cat.parent_name ?? "",
      slug: cat.slug,
      sort_order: cat.sort_order != null ? String(cat.sort_order) : "",
      spec_schema: (cat.spec_schema ?? []).map((f) => ({
        key: f.key,
        label: f.label,
        type: (f.type as SpecFieldType) ?? "text",
        options: f.options,
        required: !!f.required,
        unit: f.unit,
      })),
    });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm());
  };

  const addField = () => {
    setForm((f) => ({ ...f, spec_schema: [...f.spec_schema, emptyField()] }));
  };

  const removeField = (index: number) => {
    setForm((f) => ({ ...f, spec_schema: f.spec_schema.filter((_, i) => i !== index) }));
  };

  const updateField = (index: number, patch: Partial<SpecFieldDefinition>) => {
    setForm((f) => ({
      ...f,
      spec_schema: f.spec_schema.map((field, i) => (i === index ? { ...field, ...patch } : field)),
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.danger("Name and slug are required");
      return;
    }
    const payload = {
      name: form.name.trim(),
      parent_name: form.parent_name.trim() || undefined,
      slug: form.slug.trim(),
      sort_order: form.sort_order ? Number(form.sort_order) : undefined,
      spec_schema: form.spec_schema,
    };
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, payload });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(payload);
        toast.success("Category created");
      }
      cancelForm();
    } catch {
      // Global mutation error handler shows the toast.
    }
  };

  const handleDeactivate = async (cat: AssetCategory) => {
    if (!confirm(`Deactivate "${cat.name}"?`)) return;
    try {
      await deactivateCategory.mutateAsync(cat.id);
      toast.success("Category deactivated");
    } catch {
      // Global mutation error handler shows the toast.
    }
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Asset Categories"
      description="Manage categories and their specification fields"
      maxWidth="w-[45%]"
      footer={
        showForm ? (
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1" onClick={cancelForm} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingCategory ? "Update Category" : "Create Category"}
            </Button>
          </div>
        ) : (
          <Button className="w-full bg-brand-accent hover:bg-brand-accent/90" onClick={startCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Category
          </Button>
        )
      }
    >
      <div className="p-6 space-y-4">
        {showForm ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Parent Category</Label>
                <Input
                  value={form.parent_name}
                  onChange={(e) => setForm((f) => ({ ...f, parent_name: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Specification Fields</Label>
                <Button size="sm" variant="outline" onClick={addField}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Field
                </Button>
              </div>
              {form.spec_schema.length === 0 && (
                <p className="text-sm text-muted-foreground">No spec fields yet.</p>
              )}
              {form.spec_schema.map((field, i) => (
                <div key={i} className="p-3 border rounded-lg space-y-2 bg-slate-50">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Key (e.g. ram)"
                      value={field.key}
                      onChange={(e) => updateField(i, { key: e.target.value })}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="Label (e.g. RAM)"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateField(i, { type: v as SpecFieldType })}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="enum">Enum</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Unit (optional)"
                      value={field.unit ?? ""}
                      onChange={(e) => updateField(i, { unit: e.target.value || undefined })}
                      className="h-8 text-sm"
                    />
                  </div>
                  {field.type === "enum" && (
                    <Input
                      placeholder="Options, comma separated"
                      value={(field.options ?? []).join(", ")}
                      onChange={(e) =>
                        updateField(i, {
                          options: e.target.value
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean),
                        })
                      }
                      className="h-8 text-sm"
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={field.required}
                      onCheckedChange={(v) => updateField(i, { required: v === true })}
                    />
                    <Label className="text-xs text-slate-600">Required</Label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No categories yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([parent, cats]) => (
              <div key={parent} className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase">{parent}</h4>
                {cats.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"
                  >
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {cat.name}
                        {!cat.is_active && (
                          <Badge variant="outline" className="text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(cat.spec_schema ?? []).length} spec field
                        {(cat.spec_schema ?? []).length === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeactivate(cat)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </ReusableSheet>
  );
}
