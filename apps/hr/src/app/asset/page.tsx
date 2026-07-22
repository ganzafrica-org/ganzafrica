"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Package,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  AlertTriangle,
  CheckCircle,
  User,
  TrendingUp,
  Settings,
  Wrench,
  Loader2,
  History as HistoryIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StatsHeader } from "@/components/sections/header";
import { formatCurrency, getCategoryIcon } from "@/lib/helpers/assets-util";
import { AssetSheet } from "@/components/sections/sheets/asset-sheet";
import { MaintenanceFormSheet } from "@/components/sections/sheets/maintenance-form-sheet";
import { DataTable, ColumnDef } from "@/components/sections/table-component";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { useAssets, useAssetCategories } from "@/hooks/useAssets";
import { useEmployees } from "@/hooks/useEmployees";
import { assetsService } from "@/services/assets.service";
import type { Asset, AssetMaintenance, AssetHistoryEntry } from "@/types/api";
import { toast } from "sonner";

const chartConfig = {
  count: {
    label: "Count",
    color: "#10b981",
  },
  value: {
    label: "Value",
    color: "#3b82f6",
  },
  purchased: {
    label: "Purchased",
    color: "#10b981",
  },
  retired: {
    label: "Retired",
    color: "#ef4444",
  },
  maintenance: {
    label: "Maintenance",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const statusStyles: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800 border-green-200",
  ASSIGNED: "bg-blue-100 text-blue-800 border-blue-200",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-800 border-amber-200",
  DISPOSED: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AssetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedHistoryAssetId, setSelectedHistoryAssetId] = useState<string | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editMaintenance, setEditMaintenance] = useState<AssetMaintenance | null>(null);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<AssetMaintenance[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<AssetHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [assignDialogAsset, setAssignDialogAsset] = useState<Asset | null>(null);
  const [returnDialogAsset, setReturnDialogAsset] = useState<Asset | null>(null);
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [returnCondition, setReturnCondition] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [returnHasIssue, setReturnHasIssue] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { data: assets, isLoading: loading, refetch } = useAssets();
  const { categories } = useAssetCategories();
  const { data: employeesData } = useEmployees({ limit: 200 });
  const assetList = Array.isArray(assets) ? assets : [];
  const employees = employeesData?.data ?? [];

  useEffect(() => {
    const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null;

    const onScroll = () => {
      const y = mainEl ? mainEl.scrollTop : window.scrollY;
      setScrolled(y > 10);
    };

    onScroll();
    if (mainEl) {
      mainEl.addEventListener("scroll", onScroll, { passive: true });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      if (mainEl) {
        mainEl.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // useEffect(() => {
  //     assetsService.getAssetStats().then(setStats).catch(() => {})
  // }, [assets])

  const fetchMaintenance = () => {
    setLoadingMaintenance(true);
    assetsService
      .listMaintenance()
      .then(setMaintenanceRecords)
      .catch(() => toast.error("Failed to load maintenance records"))
      .finally(() => setLoadingMaintenance(false));
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  useEffect(() => {
    if (!selectedHistoryAssetId) {
      setHistoryRecords([]);
      return;
    }

    setLoadingHistory(true);
    assetsService
      .getAssetHistory(selectedHistoryAssetId)
      .then(setHistoryRecords)
      .catch(() => toast.error("Failed to load asset history"))
      .finally(() => setLoadingHistory(false));
  }, [selectedHistoryAssetId]);

  const handleDeleteMaintenance = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await assetsService.deleteMaintenance(id);
      toast.success("Maintenance record deleted");
      fetchMaintenance();
    } catch (error) {
      toast.error("Failed to delete record");
    }
  };

  const handleUpdateMaintenanceStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) => {
    try {
      await assetsService.updateMaintenance(id, { status, rejectionReason });
      toast.success(`Maintenance ${status.toLowerCase()} successfully`);
      fetchMaintenance();
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} maintenance`);
    }
  };

  const handleAssignAsset = async () => {
    if (!assignDialogAsset || !assignEmployeeId) {
      toast.error("Select an employee");
      return;
    }

    try {
      await assetsService.assignAsset(assignDialogAsset.id, {
        employee_id: assignEmployeeId,
      });
      toast.success("Asset assigned successfully");
      setAssignDialogAsset(null);
      setAssignEmployeeId("");
      refetch();
      if (selectedHistoryAssetId === assignDialogAsset.id) {
        setSelectedHistoryAssetId(assignDialogAsset.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign asset");
    }
  };

  const handleReturnAsset = async () => {
    if (!returnDialogAsset || !returnCondition.trim()) {
      toast.error("Condition is required");
      return;
    }

    try {
      await assetsService.returnAsset(returnDialogAsset.id, {
        condition: returnCondition,
        notes: returnNotes || undefined,
        has_issue: returnHasIssue,
      });
      toast.success("Asset returned successfully");
      setReturnDialogAsset(null);
      setReturnCondition("");
      setReturnNotes("");
      setReturnHasIssue(false);
      refetch();
      if (selectedHistoryAssetId === returnDialogAsset.id) {
        setSelectedHistoryAssetId(returnDialogAsset.id);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to return asset");
    }
  };

  const handleReportIssue = async (asset: Asset) => {
    try {
      await assetsService.updateAsset(asset.id, {
        hasIssue: "YES",
      });
      // TODO(MOD-08): create a helpdesk ticket once the issue workflow is connected.
      toast.success("Issue flagged on asset");
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to flag issue");
    }
  };

  const headerStats = useMemo(() => {
    const total = assetList.length;
    const available = assetList.filter((asset) => asset.status === "AVAILABLE").length;
    const assigned = assetList.filter((asset) => asset.status === "ASSIGNED").length;
    const underMaintenance = assetList.filter(
      (asset) => asset.status === "UNDER_MAINTENANCE",
    ).length;

    return [
      { label: "Total Assets", value: String(total), icon: Package },
      { label: "Available", value: String(available), icon: CheckCircle },
      { label: "Assigned", value: String(assigned), icon: User },
      { label: "Maintenance", value: String(underMaintenance), icon: Wrench },
    ];
  }, [assetList]);
  const assetColumns: ColumnDef<Asset>[] = [
    {
      key: "deviceName", // ← was device_name
      header: "Asset",
      sortable: true,
      render: (_, asset) => (
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shrink-0">
            {getCategoryIcon(asset.category?.slug || "")}
          </div>
          <div className="min-w-0">
            <div className="font-medium truncate">{asset.deviceName}</div>
            <div className="text-sm text-muted-foreground truncate">{asset.serialNumber}</div>
          </div>
        </div>
      ),
    },
    {
      key: "assignedToId", // ← was assigned_to_id
      header: "Assigned To",
      sortable: true,
      render: (assignedToId) =>
        assignedToId ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-600 text-xs uppercase">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium truncate max-w-[120px]">
                {assignedToId as string}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-xs">Unassigned</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (status) => (
        <Badge variant="outline" className={`capitalize ${statusStyles[status as string] ?? ""}`}>
          {(status as string).replace("_", " ").toLowerCase()}
        </Badge>
      ),
    },
    {
      key: "hasIssue", // ← was has_issue
      header: "Issue",
      sortable: true,
      render: (hasIssue) => (
        <Badge variant={hasIssue === "YES" ? "destructive" : "secondary"}>
          {hasIssue as string}
        </Badge>
      ),
    },
    {
      key: "purchasePrice", // ← was purchase_price
      header: "Purchase Price",
      sortable: true,
      render: (val) => (
        <span className="font-medium">{formatCurrency(parseFloat(val as string) || 0)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, asset) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setSelectedAssetId(asset.id);
                setSelectedHistoryAssetId(asset.id);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedHistoryAssetId(asset.id);
                setSelectedAssetId(asset.id);
              }}
            >
              <HistoryIcon className="mr-2 h-4 w-4" />
              View History
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditAsset(asset)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Asset
            </DropdownMenuItem>
            {asset.status === "ASSIGNED" ? (
              <DropdownMenuItem onClick={() => setReturnDialogAsset(asset)}>
                <User className="mr-2 h-4 w-4" />
                Return Asset
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => setAssignDialogAsset(asset)}>
                <User className="mr-2 h-4 w-4" />
                Assign Asset
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleReportIssue(asset)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issue
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const historyColumns: ColumnDef<AssetHistoryEntry>[] = [
    {
      key: "occurredAt",
      header: "Date",
      sortable: true,
      render: (date) => <span>{new Date(date as string).toLocaleString()}</span>,
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (type) => <Badge variant="outline">{String(type).toLowerCase()}</Badge>,
    },
    {
      key: "title",
      header: "Event",
      sortable: true,
    },
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (employeeName) => <span>{(employeeName as string) ?? "—"}</span>,
    },
    {
      key: "notes",
      header: "Notes",
      render: (notes, record) => (
        <span>
          {notes ? String(notes) : record.condition ? `Condition: ${record.condition}` : "—"}
        </span>
      ),
    },
  ];

  const maintenanceColumns: ColumnDef<AssetMaintenance>[] = [
    {
      key: "assetId",
      header: "Asset",
      sortable: true,
      render: (assetId) => {
        const asset = Array.isArray(assets) ? assets.find((a) => a.id === assetId) : null;
        return <div className="font-medium">{asset ? asset.deviceName : (assetId as string)}</div>;
      },
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (status) => {
        const styles: Record<string, string> = {
          PENDING: "bg-amber-100 text-amber-800",
          APPROVED: "bg-green-100 text-green-800",
          REJECTED: "bg-red-100 text-red-800",
        };
        return (
          <Badge variant="outline" className={styles[status as string]}>
            {status as string}
          </Badge>
        );
      },
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (price) => <span>{price ? formatCurrency(parseFloat(price as string)) : "-"}</span>,
    },
    {
      key: "maintenanceDate",
      header: "Maintenance Date",
      sortable: true,
      render: (date) => <span>{new Date(date as string).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setEditMaintenance(record)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {record.status === "PENDING" && (
              <>
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={() => handleUpdateMaintenanceStatus(record.id, "APPROVED")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => {
                    const reason = prompt("Enter rejection reason:");
                    if (reason !== null)
                      handleUpdateMaintenanceStatus(record.id, "REJECTED", reason);
                  }}
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeleteMaintenance(record.id)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filteredAssets = useMemo(() => {
    return assetList.filter((asset) => {
      const matchesSearch =
        (asset.deviceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (asset.serialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || asset.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assetList, searchTerm, statusFilter, categoryFilter]);

  const assetCategoryData = useMemo(() => {
    const counts = new Map<string, number>();
    assetList.forEach((asset) => {
      const key = asset.category?.name || "Uncategorized";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    const palette = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#64748b"];
    return Array.from(counts.entries()).map(([category, count], index) => ({
      category,
      count,
      fill: palette[index % palette.length],
    }));
  }, [assetList]);

  const monthlyAssetData = useMemo(() => {
    const counts = new Map<string, { purchased: number; retired: number; maintenance: number }>();
    maintenanceRecords.forEach((record) => {
      const month = new Date(record.maintenanceDate).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      const current = counts.get(month) ?? { purchased: 0, retired: 0, maintenance: 0 };
      current.maintenance += 1;
      counts.set(month, current);
    });

    filteredAssets.forEach((asset) => {
      const month = new Date(asset.createdAt).toLocaleString("en-US", {
        month: "short",
        year: "numeric",
      });
      const current = counts.get(month) ?? { purchased: 0, retired: 0, maintenance: 0 };
      current.purchased += 1;
      if (asset.status === "DISPOSED") current.retired += 1;
      counts.set(month, current);
    });

    return Array.from(counts.entries()).map(([month, values]) => ({ month, ...values }));
  }, [filteredAssets, maintenanceRecords]);
  // Inside your component
  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="space-y-6">
        <StatsHeader
          title="Assets"
          subtitle="Current condition of all assets"
          scrolled={scrolled}
          stats={headerStats}
          isLoading={loading}
          ClassName="w-full"
        />
        <Tabs defaultValue="assets" className="w-full flex flex-col">
          <TabsList className="h-auto w-fit gap-1 rounded-lg bg-slate-200 p-1.5">
            <TabsTrigger
              value="assets"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Assets Inventory
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <HistoryIcon className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="maintenance"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Maintenance
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="space-y-4">
            <Card className="rounded-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px] border-slate-200 rounded-lg">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="AVAILABLE">Available</SelectItem>
                          <SelectItem value="ASSIGNED">Assigned</SelectItem>
                          <SelectItem value="UNDER_MAINTENANCE">Maintenance</SelectItem>
                          <SelectItem value="DISPOSED">Disposed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] border-slate-200 rounded-lg">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.parent_name ? `${cat.parent_name} › ` : ""}
                              {cat.name}
                            </SelectItem>
                          )) ?? []}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="ml-auto">
                      <Button
                        onClick={() => setShowAddSheet(true)}
                        variant="outline"
                        className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Asset
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <DataTable
                columns={assetColumns}
                data={filteredAssets}
                onRowClick={(asset) => {
                  setSelectedAssetId(asset.id);
                  setSelectedHistoryAssetId(asset.id);
                }}
                searchable={false}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {!selectedHistoryAssetId ? (
              <Card className="rounded-lg">
                <CardContent className="p-6 text-center text-muted-foreground">
                  Select an asset to view its assignment and maintenance timeline.
                </CardContent>
              </Card>
            ) : loadingHistory ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <DataTable columns={historyColumns} data={historyRecords} searchable={false} />
            )}
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            {loadingMaintenance ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : maintenanceRecords.length === 0 ? (
              <Card className="rounded-lg mt-4">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="h-8 w-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-muted-foreground mb-2">
                      Asset Maintenance Tracking
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Schedule and track maintenance activities for all assets
                    </p>
                    <Button
                      onClick={() => setShowAddMaintenance(true)}
                      className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
                    >
                      <Plus className=" h-4 w-4 mr-1" />
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowAddMaintenance(true)}
                    className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white"
                  >
                    <Plus className=" h-4 w-4 mr-1" />
                    Schedule Maintenance
                  </Button>
                </div>
                <DataTable
                  columns={maintenanceColumns}
                  data={maintenanceRecords}
                  searchable={true}
                  searchPlaceholder="Search maintenance..."
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <p className="text-laj font-bold">Asset Category Distribution</p>
                  </CardTitle>
                  <CardDescription className="text-slate-900 dark:text-slate-100">
                    Assets by category and value
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ payload }) => `${payload.category}: ${payload.count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {assetCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card className="rounded-lg shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <p className="text-laj font-bold">Monthly Asset Activity</p>
                  </CardTitle>
                  <CardDescription className="text-slate-900 dark:text-slate-100">
                    Asset purchases, retirements, and maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyAssetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="purchased"
                          stroke="var(--color-purchased)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="retired"
                          stroke="var(--color-retired)"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="maintenance"
                          stroke="var(--color-maintenance)"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <MaintenanceFormSheet
          open={showAddMaintenance}
          onOpenChange={setShowAddMaintenance}
          onSuccess={fetchMaintenance}
        />

        <Dialog
          open={!!assignDialogAsset}
          onOpenChange={(open) => {
            if (!open) {
              setAssignDialogAsset(null);
              setAssignEmployeeId("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Asset</DialogTitle>
              <DialogDescription>
                Assign {assignDialogAsset?.deviceName ?? "this asset"} to an employee.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Select value={assignEmployeeId} onValueChange={setAssignEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogAsset(null)}>
                Cancel
              </Button>
              <Button
                className="bg-brand-accent hover:bg-brand-accent/90"
                onClick={handleAssignAsset}
              >
                Assign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!returnDialogAsset}
          onOpenChange={(open) => {
            if (!open) {
              setReturnDialogAsset(null);
              setReturnCondition("");
              setReturnNotes("");
              setReturnHasIssue(false);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Return Asset</DialogTitle>
              <DialogDescription>
                Capture the return condition for {returnDialogAsset?.deviceName ?? "this asset"}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Condition</Label>
                <Input
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  placeholder="e.g. Good, damaged screen"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Optional return notes"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={returnHasIssue}
                  onChange={(e) => setReturnHasIssue(e.target.checked)}
                />
                Asset has an issue
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setReturnDialogAsset(null)}>
                Cancel
              </Button>
              <Button
                className="bg-brand-accent hover:bg-brand-accent/90"
                onClick={handleReturnAsset}
              >
                Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <MaintenanceFormSheet
          open={!!editMaintenance}
          onOpenChange={(open) => !open && setEditMaintenance(null)}
          maintenance={editMaintenance}
          onSuccess={fetchMaintenance}
        />

        <ReusableSheet
          open={!!selectedAssetId}
          onOpenChange={(open) => !open && setSelectedAssetId(null)}
          title="Asset Details"
          description="Full asset information and specifications"
          maxWidth="w-[45%]"
          footer={
            <Button
              variant="outline"
              className="w-full border-slate-200 text-slate-600"
              onClick={() => setSelectedAssetId(null)}
            >
              Close
            </Button>
          }
        >
          <AssetSheet assetId={selectedAssetId} />
        </ReusableSheet>
      </div>
    </div>
  );
}
