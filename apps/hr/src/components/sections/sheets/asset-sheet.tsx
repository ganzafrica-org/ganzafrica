"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  useAsset,
  useUpdateAsset,
  useAssetCategories,
  useFlagAsset,
  useUnflagAsset,
} from "@/hooks/useAssets";
import { useEmployees } from "@/hooks/useEmployees";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  Info,
  Pencil,
  X,
  Check,
  Loader2,
  Upload,
  UserPlus,
  Undo2,
  Flag,
  History,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AssetHistoryTimeline } from "@/components/assets/asset-history-timeline";
import type { AssetIssue, AssetImage, Asset } from "@/types/api";

interface AssetSheetProps {
  assetId: string | null;
  onAssign?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
}

const formatCurrency = (value: string | null) => {
  if (!value) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
};

// Solid pill fills for the STATUS band badge — distinct from statusStyles' softer
// outline treatment used elsewhere (e.g. the assets table), matching the reference's
// filled-pill look for this one spot.
const statusPillStyles: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-700",
  DISPOSED: "bg-gray-200 text-gray-700",
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Available",
  ASSIGNED: "Assigned",
  UNDER_MAINTENANCE: "Under Maintenance",
  DISPOSED: "Disposed",
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/** One full-width labeled band — the alternating white/gray sections of the detail layout. */
function Band({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "white" | "gray";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "w-full px-6 py-4 flex flex-wrap items-start gap-x-10 gap-y-3",
        tone === "gray" ? "bg-slate-50" : "bg-white",
      )}
    >
      <span className="shrink-0 w-28 pt-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <div className="flex-1 min-w-0 flex flex-wrap items-start gap-x-10 gap-y-3">{children}</div>
    </div>
  );
}

/** A small label-above-value pair, used inside a Band (Device Name, Serial Number, etc). */
function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

/** Has Issue / Flagged indicator — red + filled flag when true, muted gray when false. */
function LifeCycleFlag({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        active ? "text-red-600 font-medium" : "text-slate-500",
      )}
    >
      {label}:
      <Flag
        className={cn("h-3.5 w-3.5", active ? "fill-red-600 text-red-600" : "text-slate-300")}
      />
      {active ? "Yes" : "No"}
    </span>
  );
}

export const AssetSheet = ({ assetId, onAssign, onReturn }: AssetSheetProps) => {
  const { data: asset, isLoading: loading, error } = useAsset(assetId);
  const { mutateAsync: updateAsset, isPending: isSaving } = useUpdateAsset();
  const { categories } = useAssetCategories();
  const { data: employeesData } = useEmployees({ limit: 200 });
  const flagAsset = useFlagAsset();
  const unflagAsset = useUnflagAsset();

  const employees = employeesData?.data ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    deviceName: "",
    serialNumber: "",
    purchasePrice: "",
    hasIssue: "" as AssetIssue,
    notes: "",
    categoryId: "",
  });

  useEffect(() => {
    if (asset && isEditing) {
      setForm({
        deviceName: asset.deviceName ?? "",
        serialNumber: asset.serialNumber ?? "",
        purchasePrice: asset.purchasePrice ?? "",
        hasIssue: asset.hasIssue ?? "NO",
        notes: asset.notes ?? "",
        categoryId: asset.categoryId ?? "",
      });
      setNewImages([]);
      setImagePreviews([]);
    }
  }, [asset, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSave = async () => {
    if (!assetId) return;
    await updateAsset({
      id: assetId,
      payload: {
        deviceName: form.deviceName,
        serialNumber: form.serialNumber,
        purchasePrice: form.purchasePrice || null,
        hasIssue: form.hasIssue,
        notes: form.notes || undefined,
        categoryId: form.categoryId || undefined,
      },
      images: newImages.length > 0 ? newImages : undefined,
    });
    setIsEditing(false);
  };

  const handleToggleFlag = () => {
    if (!asset) return;
    if (asset.isFlagged) {
      unflagAsset.mutate(asset.id);
    } else {
      flagAsset.mutate({ id: asset.id });
    }
  };

  const handleCancel = () => {
    imagePreviews.forEach((p) => URL.revokeObjectURL(p));
    setNewImages([]);
    setImagePreviews([]);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 px-6 py-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <Info className="h-10 w-10 mb-2" />
        <p>Failed to load asset details.</p>
      </div>
    );
  }

  if (!asset) return null;

  const primaryImage: AssetImage | null =
    asset.images?.find((img) => img.isPrimary) ?? asset.images?.[0] ?? null;
  const assignedEmployee = asset.assignedToId
    ? employees.find((e) => e.id === asset.assignedToId)
    : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-xl font-semibold text-slate-900">Asset Details</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="gap-1.5 text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-1.5 bg-brand-accent text-white hover:bg-brand-accent/90"
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHistory((v) => !v)}
                className="gap-1.5 text-slate-600"
              >
                <History className="h-3.5 w-3.5" />
                History
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleToggleFlag}
                disabled={flagAsset.isPending || unflagAsset.isPending}
                className={cn(
                  "gap-1.5",
                  asset.isFlagged ? "text-red-600 border-red-200" : "text-slate-600",
                )}
              >
                <Flag className="h-3.5 w-3.5" />
                {asset.isFlagged ? "Unflag" : "Flag"}
              </Button>
              {asset.status === "AVAILABLE" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAssign?.(asset)}
                  className="gap-1.5 text-slate-600"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Assign
                </Button>
              )}
              {asset.status === "ASSIGNED" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReturn?.(asset)}
                  className="gap-1.5 text-slate-600"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Return
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsEditing(true)}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing && showHistory && (
        <div className="mx-6 mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <h4 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
            <History className="h-4 w-4" />
            Asset History
          </h4>
          <AssetHistoryTimeline assetId={assetId} />
        </div>
      )}

      {isEditing ? (
        /* ── Edit Mode ──────────────────────────────────────────── */
        <div className="px-6 pb-6 space-y-5">
          {/* Basic Info */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 space-y-4">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="deviceName" className="text-xs text-slate-600">
                  Device Name
                </Label>
                <Input
                  id="deviceName"
                  value={form.deviceName}
                  onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serialNumber" className="text-xs text-slate-600">
                  Serial Number
                </Label>
                <Input
                  id="serialNumber"
                  value={form.serialNumber}
                  onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600">Category</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.parent_name ? `${cat.parent_name} › ` : ""}
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Has Issue */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-600">Has Issue</Label>
                <Select
                  value={form.hasIssue}
                  onValueChange={(v) => setForm((f) => ({ ...f, hasIssue: v as AssetIssue }))}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO">No</SelectItem>
                    <SelectItem value="YES">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Financial */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 space-y-4">
            <h4 className="font-medium text-amber-800 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Information
            </h4>
            <div className="space-y-1.5">
              <Label htmlFor="purchasePrice" className="text-xs text-slate-600">
                Purchase Price (USD)
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => setForm((f) => ({ ...f, purchasePrice: e.target.value }))}
                className="h-8 text-sm"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs text-slate-600">
                Notes
              </Label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Optional notes..."
              />
            </div>
          </div>

          {/* Images */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <h4 className="font-medium text-slate-800 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Add Images
            </h4>

            {/* Existing images (read-only preview in edit mode) */}
            {asset.images && asset.images.length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {asset.images.map((image: AssetImage) => (
                  <div key={image.id} className="relative">
                    <img
                      src={image.url}
                      alt="Asset"
                      className="h-20 w-20 object-cover rounded-lg border shadow-sm opacity-60"
                    />
                    {image.isPrimary && (
                      <Badge className="absolute top-1 left-1 bg-blue-600 text-[10px] px-1 h-4">
                        Primary
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New image previews */}
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
                      onClick={() => removeNewImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-300 rounded-lg py-4 text-sm text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Click to upload images
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </div>
      ) : (
        /* ── View Mode ──────────────────────────────────────────── */
        <>
          {/* Hero image — the dominant visual element, full width with an overlaid caption bar */}
          <div className="relative w-full h-[340px] bg-slate-100 border-y border-slate-200 overflow-hidden">
            {primaryImage ? (
              <>
                <img
                  src={primaryImage.url}
                  alt={asset.deviceName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 inset-x-0 z-10 bg-slate-100/95 border-b border-slate-200/70 px-3 py-1.5 text-sm text-slate-700">
                  {asset.deviceName}
                  {primaryImage.isPrimary ? " (Primary)" : ""}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ImageIcon className="h-10 w-10 mb-2" />
                <p className="text-sm">No images uploaded</p>
              </div>
            )}
          </div>

          {/* Banded label/value sections */}
          <div className="divide-y divide-slate-200 border-b border-slate-200">
            <Band label="STATUS:" tone="gray">
              <Badge
                className={cn(
                  "rounded-full border-0 px-3 py-1 text-xs font-medium",
                  statusPillStyles[asset.status],
                )}
              >
                {statusLabels[asset.status] ?? asset.status}
              </Badge>
              <Field label="DEVICE NAME" value={asset.deviceName} />
              <Field label="SERIAL NUMBER" value={asset.serialNumber} />
            </Band>

            <Band label="SPECIFICATIONS" tone="white">
              {asset.specs && asset.specs.length > 0 ? (
                asset.specs.map((spec: any) => {
                  const fieldDef = (asset.category?.spec_schema ?? []).find(
                    (f: any) => f.key === spec.spec_key,
                  );
                  const label = fieldDef?.label ?? spec.spec_key;
                  const unit = fieldDef?.unit;
                  return (
                    <span key={spec.spec_key} className="text-sm text-slate-700">
                      {label}:{" "}
                      <span className="font-semibold text-slate-900">
                        {spec.spec_value}
                        {unit ? ` ${unit}` : ""}
                      </span>
                    </span>
                  );
                })
              ) : (
                <span className="text-sm text-slate-400">No specifications recorded</span>
              )}
            </Band>

            <Band label="LIFE CYCLE" tone="gray">
              <LifeCycleFlag label="Has Issue" active={asset.hasIssue === "YES"} />
              <LifeCycleFlag label="Flagged" active={asset.isFlagged} />
            </Band>

            <Band label="ASSIGNMENT" tone="white">
              <Field
                label="ASSIGNED TO"
                value={
                  asset.assignedToId
                    ? assignedEmployee
                      ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}`
                      : asset.assignedToId
                    : "—"
                }
              />
              <Field label="ASSIGNED AT" value={formatDate(asset.assignedAt)} />
              <Field label="RETURNED AT" value={formatDate(asset.returnedAt)} />
            </Band>

            <Band label="FINANCIAL" tone="gray">
              <div>
                <span className="text-sm text-slate-700">Purchase Price: </span>
                <span className="text-base font-bold text-green-600">
                  {formatCurrency(asset.purchasePrice)}
                </span>
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 mt-0.5">
                  Purchase Price
                </p>
              </div>
              {asset.notes && <p className="text-sm text-slate-600 italic">Notes: {asset.notes}</p>}
            </Band>
          </div>
        </>
      )}
    </div>
  );
};
