"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { useAssetCategories, useCreateAsset } from "@/hooks/useAssets";
import type { CreateAssetRequest } from "@/types/api";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface CreateAssetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = () => ({
  deviceName: "",
  serialNumber: "",
  categoryId: "",
  purchasePrice: "",
  notes: "",
});

export function CreateAssetSheet({ open, onOpenChange }: CreateAssetSheetProps) {
  const { categories, grouped } = useAssetCategories();
  const createAsset = useCreateAsset();

  const [form, setForm] = useState(emptyForm());
  const [specValues, setSpecValues] = useState<Record<string, string>>({});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === form.categoryId) ?? null,
    [categories, form.categoryId],
  );

  useEffect(() => {
    if (!open) {
      setForm(emptyForm());
      setSpecValues({});
      setImages([]);
      setImagePreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p));
        return [];
      });
    }
  }, [open]);

  useEffect(() => {
    setSpecValues({});
  }, [form.categoryId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    if (!form.deviceName.trim() || !form.serialNumber.trim() || !form.categoryId) {
      toast.error("Device name, serial number, and category are required");
      return;
    }

    const missingRequired = (selectedCategory?.spec_schema ?? []).find(
      (field) => field.required && !specValues[field.key]?.trim(),
    );
    if (missingRequired) {
      toast.error(`"${missingRequired.label}" is required`);
      return;
    }

    const specs = (selectedCategory?.spec_schema ?? [])
      .filter((field) => specValues[field.key]?.trim())
      .map((field) => ({ key: field.key, value: specValues[field.key].trim() }));

    const payload: CreateAssetRequest = {
      deviceName: form.deviceName.trim(),
      serialNumber: form.serialNumber.trim(),
      categoryId: form.categoryId,
      purchasePrice: form.purchasePrice || undefined,
      notes: form.notes || undefined,
      specs: specs.length > 0 ? specs : undefined,
    };

    try {
      await createAsset.mutateAsync({ payload, images: images.length > 0 ? images : undefined });
      toast.success("Asset created");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Failed to create asset");
    }
  };

  return (
    <ReusableSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add Asset"
      description="Register a new asset in the inventory."
      footer={
        <div className="flex gap-3 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={createAsset.isPending}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
            onClick={handleSubmit}
            disabled={createAsset.isPending}
          >
            {createAsset.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Asset
          </Button>
        </div>
      }
    >
      <div className="space-y-5 py-4 px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Device Name *</Label>
            <Input
              value={form.deviceName}
              onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Serial Number *</Label>
            <Input
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Category *</Label>
          <Select
            value={form.categoryId}
            onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(grouped).map(([parent, cats]) =>
                cats.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {parent !== "Other" ? `${parent} › ` : ""}
                    {cat.name}
                  </SelectItem>
                )),
              )}
            </SelectContent>
          </Select>
        </div>

        {selectedCategory && selectedCategory.spec_schema.length > 0 && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <Label className="text-xs uppercase text-slate-500">Specifications</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedCategory.spec_schema.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <Label className="text-xs text-slate-600">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                    {field.unit && <span className="text-slate-400"> ({field.unit})</span>}
                  </Label>
                  {field.type === "enum" ? (
                    <Select
                      value={specValues[field.key] ?? ""}
                      onValueChange={(v) => setSpecValues((s) => ({ ...s, [field.key]: v }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "boolean" ? (
                    <Select
                      value={specValues[field.key] ?? ""}
                      onValueChange={(v) => setSpecValues((s) => ({ ...s, [field.key]: v }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      value={specValues[field.key] ?? ""}
                      onChange={(e) =>
                        setSpecValues((s) => ({ ...s, [field.key]: e.target.value }))
                      }
                      className="h-8 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Purchase Price (USD)</Label>
          <Input
            type="number"
            step="0.01"
            value={form.purchasePrice}
            onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            placeholder="Optional notes..."
          />
        </div>

        <div className="space-y-2">
          <Label>Images</Label>
          {imagePreviews.length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {imagePreviews.map((preview, i) => (
                <div key={i} className="relative group">
                  <img
                    src={preview}
                    alt="New"
                    className="h-20 w-20 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="w-full border-2 border-dashed border-slate-300 rounded-lg py-4 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            Click to upload images
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
    </ReusableSheet>
  );
}
