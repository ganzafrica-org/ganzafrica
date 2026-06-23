"use client"

import React, { useState, useEffect } from "react"
import { useAssetDetail } from "@/hooks/useAssets"
import { Badge } from "@/components/ui/badge"
import { Package, MapPin, DollarSign, Settings, Image as ImageIcon, Info, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AssetSheetProps {
    assetId: string | null
}

const formatCurrency = (value: string | null) => {
    if (!value) return "—"
    const num = parseFloat(value)
    if (isNaN(num)) return "—"
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(num)
}

const statusStyles: Record<string, string> = {
    AVAILABLE: "bg-green-100 text-green-800 border-green-200",
    ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
    UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
    DISPOSED: "bg-gray-100 text-gray-800 border-gray-200",
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    })
}

export const AssetSheet = ({ assetId }: AssetSheetProps) => {
    const { asset, loading, error } = useAssetDetail(assetId)

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
                <p>{error}</p>
            </div>
        )
    }

    if (!asset) return null

    return (
        <div className="space-y-6 py-4">
            {/* Header / Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Basic Information
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Device Name:</span>
                            <span className="font-medium">{asset.device_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Serial Number:</span>
                            <span className="font-medium">{asset.serial_number}</span>
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
                                {asset.status.replace("_", " ").toLowerCase()}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Has Issue:</span>
                            <Badge variant={asset.has_issue === "YES" ? "destructive" : "secondary"}>
                                {asset.has_issue}
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
                            <span className="text-slate-500">Assigned To ID:</span>
                            <span className="font-medium truncate max-w-[150px]">{asset.assigned_to_id ?? "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Assigned At:</span>
                            <span className="font-medium">{formatDate(asset.assigned_at)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Returned At:</span>
                            <span className="font-medium">{formatDate(asset.returned_at)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-slate-500">Flagged:</span>
                            {asset.is_flagged ? (
                                <Badge className="bg-red-500">Flagged</Badge>
                            ) : (
                                <span className="text-slate-400">No</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                <h4 className="font-medium text-amber-800 mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Information
                </h4>
                <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white bg-opacity-60">
                    <div className="font-bold text-green-600 text-2xl">{formatCurrency(asset.purchase_price)}</div>
                    <p className="text-muted-foreground text-sm uppercase tracking-wider">Purchase Price</p>
                </div>
                {asset.notes && (
                    <div className="mt-4 text-sm bg-white bg-opacity-40 p-3 rounded border border-amber-100">
                        <p className="font-medium text-amber-900 mb-1">Notes:</p>
                        <p className="text-slate-700 italic">{asset.notes}</p>
                    </div>
                )}
            </div>

            {/* Specs Card */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Specifications
                </h4>
                {asset.specs && asset.specs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        {asset.specs.map((spec) => {
                            const label = asset.category?.spec_schema.find(f => f.key === spec.spec_key)?.label ?? spec.spec_key
                            const unit = asset.category?.spec_schema.find(f => f.key === spec.spec_key)?.unit
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

            {/* Images Card */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Asset Images
                </h4>
                {asset.images && asset.images.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {asset.images.map((image) => (
                            <div key={image.id} className="relative group flex-shrink-0">
                                <img 
                                    src={image.url} 
                                    alt="Asset" 
                                    className="h-32 w-32 object-cover rounded-lg border shadow-sm"
                                />
                                {image.is_primary && (
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
        </div>
    )
}
