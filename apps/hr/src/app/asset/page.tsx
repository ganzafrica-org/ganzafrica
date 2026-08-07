"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Laptop,
  Smartphone,
  Monitor,
  Search,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  DollarSign,
  TrendingUp,
  Settings,
  Building,
  Wrench,
  Loader2,
  Trash2,
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
import { StatsHeader } from "@/components/sections/header";
import {
  // assetRequests,
  assetConditionData,
  monthlyAssetData,
} from "@/data/assets-data";
import {
  formatCurrency,
  getCategoryIcon,
  computeCategoryDistribution,
} from "@/lib/helpers/assets-util";
import { AssetSheet } from "@/components/sections/sheets/asset-sheet";
import { MaintenanceFormSheet } from "@/components/sections/sheets/maintenance-form-sheet";
import { DataTable, ColumnDef } from "@/components/sections/table-component";
import { ReusableSheet } from "@/components/sections/sheets/sheet-component";
import { AssignAssetDialog } from "@/components/assets/assign-asset-dialog";
import { ReturnAssetDialog } from "@/components/assets/return-asset-dialog";
import { CreateAssetSheet } from "@/components/assets/create-asset-sheet";
import { CategoryAdminSheet } from "@/components/assets/category-admin-sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useAssets,
  useAssetCategories,
  useFlagAsset,
  useDeleteAsset,
  useMaintenance,
  useDeleteMaintenance,
  useUpdateMaintenance,
} from "@/hooks/useAssets";
import { useEmployees } from "@/hooks/useEmployees";
import type { Asset, AssetStats, AssetMaintenance } from "@/types/api";
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
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showCategoryAdmin, setShowCategoryAdmin] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Asset | null>(null);
  const [returnTarget, setReturnTarget] = useState<Asset | null>(null);
  const [editMaintenance, setEditMaintenance] = useState<AssetMaintenance | null>(null);
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [deleteAssetTarget, setDeleteAssetTarget] = useState<Asset | null>(null);
  const [deleteMaintenanceTarget, setDeleteMaintenanceTarget] = useState<AssetMaintenance | null>(
    null,
  );

  const { data: assets, isLoading: loading, isError, refetch } = useAssets();
  const { categories } = useAssetCategories();
  const { data: employeesData } = useEmployees({ limit: 200 });
  const employees = employeesData?.data ?? [];
  const flagAsset = useFlagAsset();
  const deleteAsset = useDeleteAsset();
  const { data: maintenanceData, isLoading: loadingMaintenance } = useMaintenance();
  const maintenanceRecords = maintenanceData ?? [];
  const deleteMaintenance = useDeleteMaintenance();
  const updateMaintenanceStatus = useUpdateMaintenance();

  // Dialog (z-[150]) renders above ReusableSheet (z-[100]/z-[101]) — see components/ui/dialog.tsx
  // — so these can open on top of an already-open asset detail sheet without closing it first.
  const handleRequestAssign = (asset: Asset) => {
    setAssignTarget(asset);
  };

  const handleRequestReturn = (asset: Asset) => {
    setReturnTarget(asset);
  };

  const handleReportIssue = (asset: Asset) => {
    flagAsset.mutate(
      { id: asset.id },
      {
        onSuccess: () => toast.success("Asset flagged"),
        onError: () => toast.error("Failed to flag asset"),
      },
    );
  };

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

  // No dedicated stats endpoint exists on the backend — derive counts from the
  // already-fetched assets list (same useAssets() query the table uses) instead
  // of introducing a second round trip.
  const stats: AssetStats | null = useMemo(() => {
    if (!Array.isArray(assets)) return null;
    return {
      total: assets.length,
      available: assets.filter((a) => a.status === "AVAILABLE").length,
      assigned: assets.filter((a) => a.status === "ASSIGNED").length,
      underMaintenance: assets.filter((a) => a.status === "UNDER_MAINTENANCE").length,
      disposed: assets.filter((a) => a.status === "DISPOSED").length,
    };
  }, [assets]);

  // Real per-category counts for the analytics tab's pie chart — no dedicated backend
  // aggregate endpoint exists, so this is derived client-side from the same useAssets()/
  // useAssetCategories() queries the rest of the page already uses.
  const categoryDistribution = useMemo(() => {
    if (!Array.isArray(assets) || !Array.isArray(categories)) return [];
    return computeCategoryDistribution(assets, categories);
  }, [assets, categories]);

  const handleDeleteAsset = async () => {
    if (!deleteAssetTarget) return;
    try {
      await deleteAsset.mutateAsync(deleteAssetTarget.id);
      toast.success("Asset deleted");
      setDeleteAssetTarget(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete asset");
    }
  };

  const handleDeleteMaintenance = async () => {
    if (!deleteMaintenanceTarget) return;
    try {
      await deleteMaintenance.mutateAsync(deleteMaintenanceTarget.id);
      toast.success("Maintenance record deleted");
      setDeleteMaintenanceTarget(null);
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
      await updateMaintenanceStatus.mutateAsync({ id, payload: { status, rejectionReason } });
      toast.success(`Maintenance ${status.toLowerCase()} successfully`);
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} maintenance`);
    }
  };

  const headerStats = useMemo(() => {
    return [
      { label: "Total Assets", value: String(stats?.total ?? 0), icon: Package },
      { label: "Available", value: String(stats?.available ?? 0), icon: CheckCircle },
      { label: "Assigned", value: String(stats?.assigned ?? 0), icon: User },
      { label: "Maintenance", value: String(stats?.underMaintenance ?? 0), icon: Wrench },
    ];
  }, [stats]);
  const assetColumns: ColumnDef<Asset>[] = [
    {
      key: "deviceName", // ← was device_name
      header: "Asset",
      sortable: true,
      render: (_, asset) => {
        const thumbnail = asset.images?.find((img) => img.isPrimary) ?? asset.images?.[0] ?? null;
        return (
          <div className="flex items-center space-x-3">
            {thumbnail ? (
              <img
                src={thumbnail.url}
                alt={asset.deviceName}
                className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
              />
            ) : (
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shrink-0">
                {getCategoryIcon(asset.category?.slug || "")}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-medium truncate">{asset.deviceName}</div>
              <div className="text-sm text-muted-foreground truncate">{asset.serialNumber}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "assignedToId", // ← was assigned_to_id
      header: "Assigned To",
      sortable: true,
      render: (assignedToId) => {
        if (!assignedToId) {
          return <span className="text-muted-foreground italic text-xs">Unassigned</span>;
        }
        const emp = employees.find((e) => e.id === assignedToId);
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-green-100 text-green-600 text-xs uppercase">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium truncate max-w-[120px]">
                {emp ? `${emp.firstName} ${emp.lastName}` : (assignedToId as string)}
              </div>
            </div>
          </div>
        );
      },
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
            <DropdownMenuItem onClick={() => setSelectedAssetId(asset.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {asset.status === "AVAILABLE" && (
              <DropdownMenuItem onClick={() => handleRequestAssign(asset)}>
                <User className="mr-2 h-4 w-4" />
                Assign
              </DropdownMenuItem>
            )}
            {asset.status === "ASSIGNED" && (
              <DropdownMenuItem onClick={() => handleRequestReturn(asset)}>
                <User className="mr-2 h-4 w-4" />
                Return
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={() => handleReportIssue(asset)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Issue
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => setDeleteAssetTarget(asset)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const requestColumns: ColumnDef<any>[] = [
    {
      key: "employeeName",
      header: "Employee",
      sortable: true,
      render: (name, request) => (
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
              {name
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-sm text-muted-foreground">{request.department}</div>
          </div>
        </div>
      ),
    },
    {
      key: "requestType",
      header: "Request Type",
      sortable: true,
      render: (type) => (
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      ),
    },
    {
      key: "assetCategory",
      header: "Asset Category",
      sortable: true,
      render: (category) => (
        <div className="flex items-center gap-2">
          {getCategoryIcon(category)}
          <span className="capitalize">{category}</span>
        </div>
      ),
    },
    {
      key: "urgency",
      header: "Urgency",
      sortable: true,
      render: (urgency) => (
        <Badge
          className={
            urgency === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
          }
        >
          {urgency as string}
        </Badge>
      ),
    },
    {
      key: "budget",
      header: "Budget",
      sortable: true,
      render: (budget) => <span className="font-medium">{formatCurrency(budget as number)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (status) => (
        <Badge
          className={
            status === "approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }
        >
          {status as string}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (_, request) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              View Request
            </DropdownMenuItem>
            {request.status === "pending" && (
              <>
                <DropdownMenuItem className="text-green-600">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Reject
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
              onClick={() => setDeleteMaintenanceTarget(record)}
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
    const safeAssets = Array.isArray(assets) ? assets : [];
    return safeAssets.filter((asset) => {
      const matchesSearch =
        (asset.deviceName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (asset.serialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || asset.categoryId === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [assets, searchTerm, statusFilter, categoryFilter]);
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
            {/*<TabsTrigger*/}
            {/*  value="requests"*/}
            {/*  className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"*/}
            {/*>*/}
            {/*  <User className="h-4 w-4 mr-2" />*/}
            {/*  Asset Requests*/}
            {/*</TabsTrigger>*/}
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
                    <div className="ml-auto flex gap-2">
                      <Button
                        onClick={() => setShowCategoryAdmin(true)}
                        variant="outline"
                        className="border-slate-200 text-slate-600"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Categories
                      </Button>
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
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
                <AlertTriangle className="h-8 w-8" />
                <p>Failed to load assets.</p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  Retry
                </Button>
              </div>
            ) : (
              <DataTable
                columns={assetColumns}
                data={filteredAssets}
                onRowClick={(asset) => setSelectedAssetId(asset.id)}
                searchable={false}
              />
            )}
          </TabsContent>

          {/*<TabsContent value="requests" className="space-y-4">*/}
          {/*  <DataTable*/}
          {/*    columns={requestColumns}*/}
          {/*    data={assetRequests}*/}
          {/*    searchable={true}*/}
          {/*    searchPlaceholder="Search requests..."*/}
          {/*  />*/}
          {/*</TabsContent>*/}

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
                  {categoryDistribution.length === 0 ? (
                    <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                      No assets yet.
                    </div>
                  ) : (
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ payload }) => `${payload.category}: ${payload.count}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {categoryDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  )}
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

        <MaintenanceFormSheet open={showAddMaintenance} onOpenChange={setShowAddMaintenance} />

        <MaintenanceFormSheet
          open={!!editMaintenance}
          onOpenChange={(open) => !open && setEditMaintenance(null)}
          maintenance={editMaintenance}
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
          <AssetSheet
            assetId={selectedAssetId}
            onAssign={handleRequestAssign}
            onReturn={handleRequestReturn}
          />
        </ReusableSheet>

        <CreateAssetSheet open={showAddSheet} onOpenChange={setShowAddSheet} />

        <AssignAssetDialog
          asset={assignTarget}
          onOpenChange={(open) => !open && setAssignTarget(null)}
        />

        <ReturnAssetDialog
          asset={returnTarget}
          onOpenChange={(open) => !open && setReturnTarget(null)}
        />

        <CategoryAdminSheet open={showCategoryAdmin} onOpenChange={setShowCategoryAdmin} />

        <ConfirmDialog
          open={!!deleteAssetTarget}
          onOpenChange={(open) => !open && setDeleteAssetTarget(null)}
          title="Delete Asset"
          description={
            deleteAssetTarget
              ? `Are you sure you want to delete "${deleteAssetTarget.deviceName}"? This action cannot be undone.`
              : ""
          }
          confirmLabel="Delete"
          onConfirm={handleDeleteAsset}
          isConfirming={deleteAsset.isPending}
        />

        <ConfirmDialog
          open={!!deleteMaintenanceTarget}
          onOpenChange={(open) => !open && setDeleteMaintenanceTarget(null)}
          title="Delete Maintenance Record"
          description={
            deleteMaintenanceTarget
              ? `Are you sure you want to delete "${deleteMaintenanceTarget.title}"? This action cannot be undone.`
              : ""
          }
          confirmLabel="Delete"
          onConfirm={handleDeleteMaintenance}
          isConfirming={deleteMaintenance.isPending}
        />
      </div>
    </div>
  );
}
