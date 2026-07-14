"use client"

import React, { useState, useEffect } from "react"
import { ReusableSheet } from "./sheet-component"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { assetsService } from "@/services/assets.service"
import { useAssets } from "@/hooks/useAssets"
import { useAuth } from "@/hooks/useAuth"
import type { AssetMaintenance, CreateMaintenanceRequest, UpdateMaintenanceRequest } from "@/types/api"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"

interface MaintenanceFormSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    maintenance?: AssetMaintenance | null
    onSuccess?: () => void
}

export function MaintenanceFormSheet({ open, onOpenChange, maintenance, onSuccess }: MaintenanceFormSheetProps) {
    const isEdit = !!maintenance
    const { user } = useAuth()

    const { data } = useAssets()
    const assets = data ?? []

    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        assetId: maintenance?.assetId || "",
        title: maintenance?.title || "",
        description: maintenance?.description || "",
        price: maintenance?.price || "",
        maintenanceDate: maintenance?.maintenanceDate ? new Date(maintenance.maintenanceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: maintenance?.status || "PENDING",
        rejectionReason: maintenance?.rejectionReason || "",
    })

    useEffect(() => {
        if (maintenance) {
            setFormData({
                assetId: maintenance.assetId,
                title: maintenance.title,
                description: maintenance.description || "",
                price: maintenance.price || "",
                maintenanceDate: maintenance.maintenanceDate ? new Date(maintenance.maintenanceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: maintenance.status,
                rejectionReason: maintenance.rejectionReason || "",
            })
        } else {
            setFormData({
                assetId: "",
                title: "",
                description: "",
                price: "",
                maintenanceDate: new Date().toISOString().split('T')[0],
                status: "PENDING",
                rejectionReason: "",
            })
        }
    }, [maintenance, open])

    const handleSubmit = async () => {
        if (!formData.assetId || !formData.title || !user?.id) {
            toast.error("Please fill in all required fields")
            return
        }

        setSubmitting(true)
        try {
            if (isEdit && maintenance) {
                // Modified payload layout to safely align with Update rules
                const payload: UpdateMaintenanceRequest = {
                    ...formData,
                    price: formData.price || undefined,
                }
                await assetsService.updateMaintenance(maintenance.id, payload)
                toast.success("Maintenance record updated")
            } else {
                const payload: CreateMaintenanceRequest = {
                    ...formData,
                    requesterId: user.id,
                    price: formData.price || undefined,
                }
                await assetsService.createMaintenance(payload)
                toast.success("Maintenance scheduled successfully")
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error :any) {
            const message = error.response?.data?.message || "Something went wrong"
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <ReusableSheet
            open={open}
            onOpenChange={onOpenChange}
            title={isEdit ? "Edit Maintenance" : "Schedule Maintenance"}
            description={isEdit ? "Update maintenance record details" : "Create a new maintenance schedule for an asset"}
            footer={
                <div className="flex gap-3 w-full">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-brand-accent hover:bg-brand-accent/90"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        {isEdit ? "Update" : "Schedule"}
                    </Button>
                </div>
            }
        >
            <div className="space-y-5 py-4">
                <div className="space-y-2">
                    <Label>Asset <span className="text-red-500">*</span></Label>
                    <Select
                        value={formData.assetId}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, assetId: val }))}
                        disabled={isEdit}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select asset" />
                        </SelectTrigger>
                        <SelectContent>
                            {assets.map((asset: { id: string; deviceName: string; serialNumber: string }) => (
                                <SelectItem key={asset.id} value={asset.id}>
                                    {asset.deviceName} ({asset.serialNumber})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Title <span className="text-red-500">*</span></Label>
                    <Input
                        placeholder="Maintenance title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                        placeholder="Details about the maintenance..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Price</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            value={formData.maintenanceDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={(val: any) => setFormData(prev => ({ ...prev, status: val }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.status === "REJECTED" && (
                    <div className="space-y-2">
                        <Label>Rejection Reason</Label>
                        <Textarea
                            placeholder="Why was it rejected?"
                            value={formData.rejectionReason}
                            onChange={(e) => setFormData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                        />
                    </div>
                )}
            </div>
        </ReusableSheet>
    )
}