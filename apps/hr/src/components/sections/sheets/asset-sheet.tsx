import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from "@/components/ui/sheet";
import { AssetDraft, AssetStatus } from "@/data/assets-data";
import { Package, MapPin, DollarSign, Settings, Wrench, Edit } from "lucide-react";
import React from "react";

interface AssetSheetProps {
    assetDialogDraft: AssetDraft;
    setAssetDialogDraft: React.Dispatch<React.SetStateAction<AssetDraft>>;
    isView: boolean;
    assetDialogOpen: boolean;
    onOpenChange: (open: boolean) => void;
    assetDialogMode: "create" | "edit" | "view";
    defaultDraft: AssetDraft;
}

const formatCurrency = (value: number) => {
    if (value == null || isNaN(value)) return "—";
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(value);
};

const statusStyles: Record<string, string> = {
    available: "bg-green-100 text-green-800 border-green-200",
    assigned: "bg-blue-100 text-blue-800 border-blue-200",
    maintenance: "bg-amber-100 text-amber-800 border-amber-200",
    retired: "bg-gray-100 text-gray-800 border-gray-200",
};

const conditionStyles: Record<string, string> = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    fair: "bg-amber-100 text-amber-800 border-amber-200",
    poor: "bg-red-100 text-red-800 border-red-200",
};

const getStatusBadge = (status: AssetStatus) => (
    <Badge variant="outline" className={`capitalize ${statusStyles[status] ?? ""}`}>
        {status}
    </Badge>
);

const getConditionBadge = (condition: string) => (
    <Badge variant="outline" className={`capitalize ${conditionStyles[condition] ?? ""}`}>
        {condition}
    </Badge>
);

export const AssetSheet = ({
    assetDialogDraft,
    assetDialogOpen,
    onOpenChange,
}: AssetSheetProps) => {
    const asset = assetDialogDraft;

    return (
        <Sheet open={assetDialogOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-600" />
                        Asset Details - {asset.name}
                    </SheetTitle>
                    <SheetDescription>
                        Complete information for {asset.assetTag}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Basic Information
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Asset Tag:</span>
                                        <span className="font-medium">{asset.assetTag}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Name:</span>
                                        <span className="font-medium">{asset.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Brand:</span>
                                        <span className="font-medium">{asset.brand}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Model:</span>
                                        <span className="font-medium">{asset.model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Serial Number:</span>
                                        <span className="font-medium">{asset.serialNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Category:</span>
                                        <Badge variant="outline" className="capitalize">
                                            {asset.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Status & Location
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span>Status:</span>
                                        {/* {getStatusBadge(asset.status)} */}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Condition:</span>
                                        {getConditionBadge(asset.condition)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Location:</span>
                                        <span className="font-medium">{asset.location}</span>
                                    </div>
                                    {asset.assignedTo && (
                                        <>
                                            <div className="flex justify-between">
                                                <span>Assigned To:</span>
                                                <span className="font-medium">{asset.assignedTo}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Department:</span>
                                                <span className="font-medium">{asset.department}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Assigned Date:</span>
                                                <span className="font-medium">{asset.assignedDate}</span>
                                            </div>
                                        </>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                <div className="font-bold text-green-600 text-lg">{formatCurrency(asset.purchasePrice)}</div>
                                <p className="text-muted-foreground">Purchase Price</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                <div className="font-bold text-blue-600 text-lg">{formatCurrency(asset.currentValue)}</div>
                                <p className="text-muted-foreground">Current Value</p>
                            </div>
                            <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                <div className="font-bold text-purple-600 text-lg">
                                    {asset.purchasePrice
                                        ? Math.round(((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100)
                                        : 0}%
                                </div>
                                <p className="text-muted-foreground">Depreciation</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                            <div className="flex justify-between">
                                <span>Purchase Date:</span>
                                <span className="font-medium">{asset.purchaseDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Warranty Expires:</span>
                                <span className="font-medium">{asset.warranty}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Specifications
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {Object.entries(asset.specifications ?? {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between p-2 bg-white bg-opacity-60 rounded">
                                    <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}:</span>
                                    <span className="font-medium">{String(value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                        <h4 className="font-medium text-slate-800 mb-4 flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Maintenance History
                        </h4>
                        {asset.maintenanceHistory?.length > 0 ? (
                            <div className="space-y-3">
                                {asset.maintenanceHistory.map((maintenance: any, index: number) => (
                                    <div key={index} className="border rounded-lg p-4 bg-white">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-sm">{maintenance.type}</p>
                                                <p className="text-xs text-muted-foreground">{maintenance.date}</p>
                                                {maintenance.notes && (
                                                    <p className="text-xs text-muted-foreground mt-1">{maintenance.notes}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium text-sm">{formatCurrency(maintenance.cost)}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground">No maintenance history recorded</p>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Asset
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};