"use client"

import React, { useState, useEffect, useRef } from "react"
import { useAsset, useUpdateAsset, useAssetCategories } from "@/hooks/useAssets"
import { useEmployees } from "@/hooks/useEmployees"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, DollarSign, Settings, Image as ImageIcon, Info, Calendar, Pencil, X, Check, Loader2, Upload, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { AssetStatus, AssetIssue, AssetImage } from "@/types/api"

interface AssetSheetProps {
    assetId: string | null
}

const formatCurrency = (value: string | null) => {
    if (!value) return "—"
    const num = parseFloat(value)
    if (isNaN(num)) return "—"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800 border-green-200",
    ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
    UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
    DISPOSED: "bg-gray-100 text-gray-800 border-gray-200",
}

const statusLabels: Record<string, string> = {
    AVAILABLE: "Available",
    ASSIGNED: "Assigned",
    UNDER_MAINTENANCE: "Under Maintenance",
    DISPOSED: "Disposed",
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export const AssetSheet = ({ assetId }: AssetSheetProps) => {
    const { data: asset, isLoading: loading, error } = useAsset(assetId)
    const { mutateAsync: updateAsset, isPending: isSaving } = useUpdateAsset()
    const { categories } = useAssetCategories()
    const { data: employeesData } = useEmployees({ limit: 200 })

    const employees = employeesData?.data ?? []

    const [isEditing, setIsEditing] = useState(false)
    const [newImages, setNewImages] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        deviceName: "",
        serialNumber: "",
        purchasePrice: "",
        status: "" as AssetStatus,
        hasIssue: "" as AssetIssue,
        isFlagged: false,
        notes: "",
        categoryId: "",
        assignedToId: "" as string | null,
    })

    useEffect(() => {
        if (asset && isEditing) {
            setForm({
                deviceName: asset.deviceName ?? "",
                serialNumber: asset.serialNumber ?? "",
                purchasePrice: asset.purchasePrice ?? "",
                status: asset.status ?? "AVAILABLE",
                hasIssue: asset.hasIssue ?? "NO",
                isFlagged: asset.isFlagged ?? false,
                notes: asset.notes ?? "",
                categoryId: asset.categoryId ?? "",
                assignedToId: asset.assignedToId ?? null,
            })
            setNewImages([])
            setImagePreviews([])
        }
    }, [asset, isEditing])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? [])
        if (!files.length) return
        setNewImages(prev => [...prev, ...files])
        const previews = files.map(f => URL.createObjectURL(f))
        setImagePreviews(prev => [...prev, ...previews])
    }

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => {
            URL.revokeObjectURL(prev[index])
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleSave = async () => {
        if (!assetId) return
        await updateAsset({
            id: assetId,
            payload: {
                deviceName: form.deviceName,
                serialNumber: form.serialNumber,
                purchasePrice: form.purchasePrice || null,
                status: form.status,
                hasIssue: form.hasIssue,
                isFlagged: form.isFlagged,
                notes: form.notes || undefined,
                categoryId: form.categoryId || undefined,
                assignedToId: form.assignedToId || null,
            },
            images: newImages.length > 0 ? newImages : undefined,
        })
        setIsEditing(false)
    }

    const handleCancel = () => {
        imagePreviews.forEach(p => URL.revokeObjectURL(p))
        setNewImages([])
        setImagePreviews([])
        setIsEditing(false)
    }

    if (loading) {
        return (
            <div className="space-y-6 py-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
                <Info className="h-10 w-10 mb-2" />
                <p>Failed to load asset details.</p>
            </div>
        )
    }

    if (!asset) return null

    return (
        <div className="space-y-6 py-4">
            {/* Toolbar */}
            <div className="w-full flex justify-end gap-2">
                {isEditing ? (
                    <>
                        <Button size="sm" variant="outline" onClick={handleCancel} disabled={isSaving} className="gap-1.5 text-slate-600">
                            <X className="h-3.5 w-3.5" />
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5 bg-brand-accent text-white hover:bg-brand-accent/90">
                            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors" title="Edit asset">
                        <Pencil className="h-4 w-4 text-brand-dark" />
                    </button>
                )}
            </div>

            {isEditing ? (
                /* ── Edit Mode ──────────────────────────────────────────── */
                <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 space-y-4">
                        <h4 className="font-medium text-blue-800 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="deviceName" className="text-xs text-slate-600">Device Name</Label>
                                <Input id="deviceName" value={form.deviceName} onChange={e => setForm(f => ({ ...f, deviceName: e.target.value }))} className="h-8 text-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="serialNumber" className="text-xs text-slate-600">Serial Number</Label>
                                <Input id="serialNumber" value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} className="h-8 text-sm" />
                            </div>
                        </div>

                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">Category</Label>
                            <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories ?? []).map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.parent_name ? `${cat.parent_name} › ` : ""}{cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">Status</Label>
                                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as AssetStatus }))}>
                                    <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AVAILABLE">Available</SelectItem>
                                        <SelectItem value="ASSIGNED">Assigned</SelectItem>
                                        <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                                        <SelectItem value="DISPOSED">Disposed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Has Issue */}
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-600">Has Issue</Label>
                                <Select value={form.hasIssue} onValueChange={v => setForm(f => ({ ...f, hasIssue: v as AssetIssue }))}>
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

                        {/* Assign To Employee */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-600">Assigned To</Label>
                            <Select
                                value={form.assignedToId ?? "unassigned"}
                                onValueChange={v => setForm(f => ({ ...f, assignedToId: v === "unassigned" ? null : v }))}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Select employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">
                                        <span className="text-slate-400 italic">Unassigned</span>
                                    </SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                            <span className="ml-2 text-xs text-slate-400">{emp.position}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Is Flagged */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isFlagged"
                                checked={form.isFlagged}
                                onChange={e => setForm(f => ({ ...f, isFlagged: e.target.checked }))}
                                className="h-4 w-4 rounded border-slate-300"
                            />
                            <Label htmlFor="isFlagged" className="text-xs text-slate-600">Flag this asset</Label>
                        </div>
                    </div>

                    {/* Financial */}
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200 space-y-4">
                        <h4 className="font-medium text-amber-800 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Financial Information
                        </h4>
                        <div className="space-y-1.5">
                            <Label htmlFor="purchasePrice" className="text-xs text-slate-600">Purchase Price (USD)</Label>
                            <Input
                                id="purchasePrice"
                                type="number"
                                step="0.01"
                                value={form.purchasePrice}
                                onChange={e => setForm(f => ({ ...f, purchasePrice: e.target.value }))}
                                className="h-8 text-sm"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="notes" className="text-xs text-slate-600">Notes</Label>
                            <textarea
                                id="notes"
                                value={form.notes}
                                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
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
                                        <img src={image.url} alt="Asset" className="h-20 w-20 object-cover rounded-lg border shadow-sm opacity-60" />
                                        {image.isPrimary && (
                                            <Badge className="absolute top-1 left-1 bg-blue-600 text-[10px] px-1 h-4">Primary</Badge>
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
                                        <img src={preview} alt="New" className="h-20 w-20 object-cover rounded-lg border shadow-sm" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Basic Information
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Device Name:</span>
                                    <span className="font-medium">{asset.deviceName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Serial Number:</span>
                                    <span className="font-medium">{asset.serialNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Category:</span>
                                    <Badge variant="outline" className="capitalize">
                                        {asset.category?.parent_name ? `${asset.category.parent_name} › ` : ""}{asset.category?.name}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status:</span>
                                    <Badge variant="outline" className={cn("capitalize", statusStyles[asset.status])}>
                                        {statusLabels[asset.status] ?? asset.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Has Issue:</span>
                                    <Badge variant={asset.hasIssue === "YES" ? "destructive" : "secondary"}>
                                        {asset.hasIssue}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Assignment Details
                            </h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Assigned To:</span>
                                    <span className="font-medium truncate max-w-[150px]">
                                        {asset.assignedToId
                                            ? (() => {
                                                const emp = employees.find(e => e.id === asset.assignedToId)
                                                return emp ? `${emp.firstName} ${emp.lastName}` : asset.assignedToId
                                            })()
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Assigned At:</span>
                                    <span className="font-medium">{formatDate(asset.assignedAt)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Returned At:</span>
                                    <span className="font-medium">{formatDate(asset.returnedAt)}</span>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-slate-500">Flagged:</span>
                                    {asset.isFlagged ? (
                                        <Badge className="bg-red-500">Flagged</Badge>
                                    ) : (
                                        <span className="text-slate-400">No</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                        <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Financial Information
                        </h4>
                        <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white bg-opacity-60">
                            <div className="font-bold text-green-600 text-2xl">{formatCurrency(asset.purchasePrice)}</div>
                            <p className="text-muted-foreground text-sm uppercase tracking-wider">Purchase Price</p>
                        </div>
                        {asset.notes && (
                            <div className="mt-4 text-sm bg-white bg-opacity-40 p-3 rounded border border-amber-100">
                                <p className="font-medium text-amber-900 mb-1">Notes:</p>
                                <p className="text-slate-700 italic">{asset.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Specifications
                        </h4>
                        {asset.specs && asset.specs.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {asset.specs.map((spec: any) => {
                                    const label = (asset.category?.spec_schema ?? []).find((f: any) => f.key === spec.spec_key)?.label ?? spec.spec_key
                                    const unit = (asset.category?.spec_schema ?? []).find((f: any) => f.key === spec.spec_key)?.unit
                                    return (
                                        <div key={spec.spec_key} className="flex justify-between p-2.5 bg-white bg-opacity-60 rounded-md border border-purple-100">
                                            <span className="text-slate-600 font-medium">{label}:</span>
                                            <span className="font-semibold text-slate-900">{spec.spec_value}{unit ? ` ${unit}` : ""}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-white bg-opacity-40 rounded border border-dashed border-purple-300">
                                <p className="text-sm text-slate-500">No specifications recorded</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Asset Images
                        </h4>
                        {asset.images && asset.images.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {asset.images.map((image: any) => (
                                    <div key={image.id} className="relative group flex-shrink-0">
                                        <img src={image.url} alt="Asset" className="h-32 w-32 object-cover rounded-lg border shadow-sm" />
                                        {image.isPrimary && (
                                            <Badge className="absolute top-1 left-1 bg-blue-600 text-[10px] px-1.5 h-4">Primary</Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-white bg-opacity-60 rounded border border-dashed">
                                <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">No images uploaded</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}