"use client"

import React, { useState, useEffect, useRef } from "react"
import { ReusableSheet } from "./sheet-component"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { assetsService } from "@/services/assets.service"
import { useAssetCategories } from "@/hooks/useAssets"
import type { Asset, AssetCategory, CreateAssetRequest, AssetStatus, AssetIssue } from "@/types/api"
import { Loader2, Plus, X, Upload, Trash2, ArrowLeft, ArrowRight, Save, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface AssetFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    asset?: Asset | null
    onSuccess?: () => void
}

export function AssetFormSheet({ open, onOpenChange, asset, onSuccess }: AssetFormSheetProps) {
    const isEdit = !!asset
    const [step, setStep] = useState(isEdit ? 2 : 1)
    const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(asset?.category || null)
    const [submitting, setSubmitting] = useState(false)
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [imagePreviews, setImagePreviews] = useState<string[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { grouped: groupedCategories, loading: categoriesLoading } = useAssetCategories()

    // Form state
    const [formData, setFormData] = useState({
        deviceName: asset?.device_name || "",
        serialNumber: asset?.serial_number || "",
        purchasePrice: asset?.purchase_price || "",
        status: (asset?.status as AssetStatus) || "AVAILABLE",
        assignedToId: asset?.assigned_to_id || "",
        notes: asset?.notes || "",
        isFlagged: asset?.is_flagged || false,
        hasIssue: (asset?.has_issue as AssetIssue) || "NO",
    })

    // Specs state
    const [specs, setSpecs] = useState<Record<string, string>>({})

    useEffect(() => {
        if (asset?.specs) {
            const specMap: Record<string, string> = {}
            asset.specs.forEach(s => {
                specMap[s.spec_key] = s.spec_value
            })
            setSpecs(specMap)
        }
    }, [asset])

    const handleCategorySelect = (category: AssetCategory) => {
        setSelectedCategory(category)
        setStep(2)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setImageFiles(prev => [...prev, ...files])
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setImagePreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removeNewImage = (index: number) => {
        URL.revokeObjectURL(imagePreviews[index])
        setImageFiles(prev => prev.filter((_, i) => i !== index))
        setImagePreviews(prev => prev.filter((_, i) => i !== index))
    }

    const handleDeleteExistingImage = async (imageId: string) => {
        if (!asset) return
        try {
            await assetsService.deleteAssetImage(asset.id, imageId)
            toast.success("Image deleted")
            onSuccess?.()
        } catch (error) {
            toast.error("Failed to delete image")
        }
    }

    const handleSubmit = async () => {
        if (!selectedCategory) return
        
        setSubmitting(true)
        try {
            const specArray = Object.entries(specs).map(([key, value]) => ({ key, value }))
            const payload: CreateAssetRequest = {
                ...formData,
                categoryId: selectedCategory.id,
                specs: specArray,
                purchasePrice: formData.purchasePrice || null,
            }

            if (isEdit && asset) {
                await assetsService.updateAsset(asset.id, payload, imageFiles)
                toast.success("Asset updated successfully")
            } else {
                await assetsService.createAsset(payload, imageFiles)
                toast.success("Asset created successfully")
            }
            
            onSuccess?.()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ReusableSheet
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? `Edit Asset: ${asset.device_name}` : "Add New Asset"}
            description={step === 1 ? "Select a category for the new asset" : "Fill in the asset details"}
            footer={
                <div className="flex w-full gap-3">
                    {step === 2 && !isEdit && (
                        <Button variant="outline" className="flex-1" onClick={() => setStep(1)} disabled={submitting}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                    )}
                    <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" 
                        onClick={step === 1 ? () => {} : handleSubmit}
                        disabled={step === 1 || submitting}
                    >
                        {submitting ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : isEdit ? (
                            <Save className="w-4 h-4 mr-2" />
                        ) : (
                            <Plus className="w-4 h-4 mr-2" />
                        )}
                        {isEdit ? "Update Asset" : "Create Asset"}
                    </Button>
                </div>
            }
        >
            <div className="py-6 space-y-8">
                {step === 1 ? (
                    <div className="space-y-6">
                        {categoriesLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            Object.entries(groupedCategories).map(([parent, cats]) => (
                                <div key={parent} className="space-y-3">
                                    <h3 className="text-sm font-semibold text-slate-900 px-1">{parent}</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {cats.map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => handleCategorySelect(cat)}
                                                className="flex flex-col items-start p-4 text-left border rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mb-3 group-hover:bg-blue-600 transition-colors">
                                                    <Package className="w-4 h-4 text-blue-600 group-hover:text-white" />
                                                </div>
                                                <span className="text-sm font-medium">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-8 px-1">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                <span className="w-1 h-4 bg-blue-600 rounded-full" />
                                Fixed Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Device Name *</Label>
                                    <Input 
                                        value={formData.deviceName} 
                                        onChange={e => setFormData(prev => ({ ...prev, deviceName: e.target.value }))}
                                        placeholder="e.g. MacBook Pro M3"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Serial Number *</Label>
                                    <Input 
                                        value={formData.serialNumber} 
                                        onChange={e => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                                        placeholder="SN-12345678"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Purchase Price</Label>
                                    <Input 
                                        type="number"
                                        value={formData.purchasePrice} 
                                        onChange={e => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Status</Label>
                                    <Select 
                                        value={formData.status} 
                                        onValueChange={v => setFormData(prev => ({ ...prev, status: v as AssetStatus }))}
                                    >
                                        <SelectTrigger className="w-full">
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
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Assigned To (ID)</Label>
                                    <Input 
                                        value={formData.assignedToId} 
                                        onChange={e => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
                                        placeholder="UUID"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Has Issue?</Label>
                                    <Select 
                                        value={formData.hasIssue} 
                                        onValueChange={v => setFormData(prev => ({ ...prev, hasIssue: v as AssetIssue }))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="NO">No</SelectItem>
                                            <SelectItem value="YES">Yes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <Checkbox 
                                        id="isFlagged" 
                                        checked={formData.isFlagged} 
                                        onCheckedChange={v => setFormData(prev => ({ ...prev, isFlagged: !!v }))}
                                    />
                                    <Label htmlFor="isFlagged" className="text-xs cursor-pointer">Flag this asset</Label>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Notes</Label>
                                <Textarea 
                                    value={formData.notes} 
                                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Add any additional details..."
                                    className="resize-none"
                                />
                            </div>
                        </div>

                        {/* Dynamic Specs Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                <span className="w-1 h-4 bg-purple-600 rounded-full" />
                                {selectedCategory?.name} Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedCategory?.spec_schema.map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label className="text-xs">
                                            {field.label} {field.required && "*"}
                                            {field.unit && <span className="text-slate-400 ml-1">({field.unit})</span>}
                                        </Label>
                                        
                                        {field.type === "enum" ? (
                                            <Select 
                                                value={specs[field.key] || ""} 
                                                onValueChange={v => setSpecs(prev => ({ ...prev, [field.key]: v }))}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select option" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {field.options?.map(opt => (
                                                        <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        ) : field.type === "boolean" ? (
                                            <div className="flex items-center h-10 space-x-2">
                                                <Checkbox 
                                                    id={field.key}
                                                    checked={specs[field.key] === "true"}
                                                    onCheckedChange={v => setSpecs(prev => ({ ...prev, [field.key]: String(v) }))}
                                                />
                                                <Label htmlFor={field.key} className="text-xs">Yes</Label>
                                            </div>
                                        ) : (
                                            <Input 
                                                type={field.type === "number" ? "number" : "text"}
                                                value={specs[field.key] || ""}
                                                onChange={e => setSpecs(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                placeholder={field.label}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Images Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800">
                                <span className="w-1 h-4 bg-emerald-600 rounded-full" />
                                Asset Images
                            </h3>
                            
                            <div className="space-y-4">
                                {/* Existing Images */}
                                {isEdit && asset?.images && asset.images.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {asset.images.map(img => (
                                            <div key={img.id} className="relative w-24 h-24 rounded-lg overflow-hidden border">
                                                <img src={img.url} className="w-full h-full object-cover" alt="Asset" />
                                                <button 
                                                    onClick={() => handleDeleteExistingImage(img.id)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-sm"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* New Image Previews */}
                                {imagePreviews.length > 0 && (
                                    <div className="flex flex-wrap gap-3">
                                        {imagePreviews.map((preview, i) => (
                                            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-blue-200">
                                                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                                <button 
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-1 right-1 bg-slate-800 text-white p-1 rounded-full hover:bg-slate-900 shadow-sm"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload Trigger */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                        <Upload className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-900">Upload Images</p>
                                    <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        multiple 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ReusableSheet>
    )
}
