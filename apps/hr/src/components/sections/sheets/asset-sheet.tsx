import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AssetDraft, AssetStatus} from "@/data/assets-data";
import {Textarea} from "@/components/ui/textarea";
import React, {useEffect} from "react";

interface AssetSheetProps {
    assetDialogDraft: AssetDraft;
    setAssetDialogDraft: React.Dispatch<React.SetStateAction<AssetDraft>>;
    isView: boolean;
    assetDialogOpen: boolean;
    assetDialogMode: "create" | "edit" | "view";
    defaultDraft: AssetDraft;
}

export const AssetSheet = ({
    assetDialogDraft,
    setAssetDialogDraft,
    isView,
    assetDialogOpen,
    assetDialogMode,
    defaultDraft
}: AssetSheetProps) => {

    useEffect(() => {
        if (assetDialogOpen && assetDialogMode === "create") {
            setAssetDialogDraft(defaultDraft);
        }
    }, [assetDialogOpen, assetDialogMode, defaultDraft, setAssetDialogDraft]);

    return (
        <div className="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
            <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial number</Label>
                <Input
                    id="serialNumber"
                    value={assetDialogDraft.serialNumber}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, serialNumber: e.target.value }))}
                    disabled={isView}
                    placeholder="e.g. FHN6QDU004L"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="deviceType">Device</Label>
                <Input
                    id="deviceType"
                    value={assetDialogDraft.deviceType}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, deviceType: e.target.value }))}
                    disabled={isView}
                    placeholder="e.g. Laptop (Lenovo ThinkPad)"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="generation">Generation</Label>
                <Input
                    id="generation"
                    value={assetDialogDraft.generation}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, generation: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="core">Core</Label>
                <Input
                    id="core"
                    value={assetDialogDraft.core}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, core: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="ram">RAM</Label>
                <Input
                    id="ram"
                    value={assetDialogDraft.ram}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, ram: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="hardDisk">Hard disk</Label>
                <Input
                    id="hardDisk"
                    value={assetDialogDraft.hardDisk}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, hardDisk: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase price (USD)</Label>
                <Input
                    id="purchasePrice"
                    type="number"
                    value={assetDialogDraft.purchasePrice}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, purchasePrice: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned to</Label>
                <Input
                    id="assignedTo"
                    value={assetDialogDraft.assignedTo}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, assignedTo: e.target.value }))}
                    disabled={isView}
                    placeholder="UNASSIGNED or employee name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="assignedDate">Assigned date</Label>
                <Input
                    id="assignedDate"
                    type="date"
                    value={assetDialogDraft.assignedDate}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, assignedDate: e.target.value }))}
                    disabled={isView}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="hasAntivirus">Antivirus</Label>
                <Select
                    value={assetDialogDraft.hasAntivirus}
                    onValueChange={(v) =>
                        setAssetDialogDraft((d) => ({
                            ...d,
                            hasAntivirus: v as AssetStatus,
                            antivirusExpiry: v === "no" ? "" : d.antivirusExpiry,
                        }))
                    }
                    disabled={isView}
                >
                    <SelectTrigger id="hasAntivirus">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="antivirusExpiry">AV expiry</Label>
                <Input
                    id="antivirusExpiry"
                    type="date"
                    value={assetDialogDraft.antivirusExpiry}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, antivirusExpiry: e.target.value }))}
                    disabled={isView || assetDialogDraft.hasAntivirus === "no"}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="hasMicrosoftOffice">MS Office</Label>
                <Select
                    value={assetDialogDraft.hasMicrosoftOffice}
                    onValueChange={(v) =>
                        setAssetDialogDraft((d) => ({
                            ...d,
                            hasMicrosoftOffice: v as AssetStatus,
                            officeExpiry: v === "no" ? "" : d.officeExpiry,
                        }))
                    }
                    disabled={isView}
                >
                    <SelectTrigger id="hasMicrosoftOffice">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="officeExpiry">Office expiry</Label>
                <Input
                    id="officeExpiry"
                    type="date"
                    value={assetDialogDraft.officeExpiry}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, officeExpiry: e.target.value }))}
                    disabled={isView || assetDialogDraft.hasMicrosoftOffice === "no"}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="issues">Issues</Label>
                <Select
                    value={assetDialogDraft.issues}
                    onValueChange={(v) =>
                        setAssetDialogDraft((d) => ({
                            ...d,
                            issues: v as AssetStatus,
                            explainIssue: v === "no" ? "" : d.explainIssue,
                        }))
                    }
                    disabled={isView}
                >
                    <SelectTrigger id="issues">
                        <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
                <Label htmlFor="explainIssue">Explain issues</Label>
                <Textarea
                    id="explainIssue"
                    value={assetDialogDraft.explainIssue}
                    onChange={(e) => setAssetDialogDraft((d) => ({ ...d, explainIssue: e.target.value }))}
                    disabled={isView || assetDialogDraft.issues === "no"}
                    placeholder="Describe the issue (only when Issues = Yes)"
                    className="min-h-[110px]"
                />
            </div>
        </div>
    );
};
