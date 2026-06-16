"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
    Package,
    Laptop,
    Smartphone,
    Monitor,
    Search,
    Download,
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
    Wrench
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { StatsHeader } from "@/components/sections/header"
import { TimeOffStats } from "@/data/Header-data"
import { assetsData, assetRequests, assetCategoryData, assetConditionData, monthlyAssetData, AssetStatus } from "@/data/assets-data"
import { getStatusBadge, getConditionBadge, getRequestStatusBadge, getUrgencyBadge, getCategoryIcon, formatCurrency } from "@/lib/helpers/assets-util"
import { AssetSheet } from "@/components/sections/sheets/asset-sheet"
import { ReusableSheet } from "@/components/sections/sheets/sheet-component"

export const chartConfig = {
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
} satisfies ChartConfig

export default function AssetsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [selectedAsset, setSelectedAsset] = useState<any>(null)
    const [showAssetDialog, setShowAssetDialog] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const mainEl = document.querySelector("main.overflow-auto") as HTMLElement | null

        const onScroll = () => {
            const y = mainEl ? mainEl.scrollTop : window.scrollY
            setScrolled(y > 10)
        }

        onScroll()
        if (mainEl) {
            mainEl.addEventListener("scroll", onScroll, { passive: true })
        }
        window.addEventListener("scroll", onScroll, { passive: true })

        return () => {
            if (mainEl) {
                mainEl.removeEventListener("scroll", onScroll)
            }
            window.removeEventListener("scroll", onScroll)
        }
    }, [])

    const filteredAssets = assetsData.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assetTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
            asset.assignedTo?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || asset.status === statusFilter
        const matchesCategory = categoryFilter === "all" || asset.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
    })

    return (
        <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="space-y-6">
                <StatsHeader
                    title="Assets"
                    subtitle="Current condition of all assets"
                    scrolled={scrolled}
                    stats={TimeOffStats}
                    ClassName="w-full"
                />
                <Tabs defaultValue="assets" className="w-full flex flex-col">
                    <TabsList className="h-auto w-fit gap-1 rounded-lg bg-slate-200 p-1.5">
                        <TabsTrigger value="assets" className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <Package className="h-4 w-4 mr-2" />
                            Assets Inventory
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <User className="h-4 w-4 mr-2" />
                            Asset Requests
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <Wrench className="h-4 w-4 mr-2" />
                            Maintenance
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="assets" className="space-y-4">

                        <Card className="rounded-lg">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                            <div className="relative flex-1 max-w-sm w-[80%]">
                                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Search assets..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                                />
                                            </div>
                                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                                <SelectTrigger className="w-[150px] border-slate-200 rounded-lg py-4.5">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Status</SelectItem>
                                                    <SelectItem value="assigned">Assigned</SelectItem>
                                                    <SelectItem value="available">Available</SelectItem>
                                                    <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    <SelectItem value="retired">Retired</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                                <SelectTrigger className="w-[150px] border-slate-200 rounded-lg py-4.5">
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Categories</SelectItem>
                                                    <SelectItem value="laptop">Laptops</SelectItem>
                                                    <SelectItem value="phone">Phones</SelectItem>
                                                    <SelectItem value="monitor">Monitors</SelectItem>
                                                    <SelectItem value="tablet">Tablets</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {/* align the button to the right */}
                                        <div className="flex justify-end w-[20%]">
                                            <Button variant="outline" className="text-brand-accent bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white h-full">
                                                <Plus className="h-4 w-4" />
                                                Add Asset
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                        <Card className="rounded-lg">
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Asset</TableHead>
                                            <TableHead>Assigned To</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Condition</TableHead>
                                            <TableHead>Location</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredAssets.map((asset) => (
                                            <TableRow key={asset.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                                                            {getCategoryIcon(asset.category)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{asset.name}</div>
                                                            <div className="text-sm text-muted-foreground">{asset.assetTag}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {asset.assignedTo ? (
                                                        <div className="flex items-center space-x-2">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                    {asset.assignedTo.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-medium">{asset.assignedTo}</div>
                                                                <div className="text-xs text-muted-foreground">{asset.department}</div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(asset.status as AssetStatus)}</TableCell>
                                                <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm">{asset.location}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">{formatCurrency(asset.currentValue)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => {
                                                                setSelectedAsset(asset)
                                                                setShowAssetDialog(true)
                                                            }}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Details
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Asset
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <User className="mr-2 h-4 w-4" />
                                                                Assign/Unassign
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem>
                                                                <AlertTriangle className="mr-2 h-4 w-4" />
                                                                Report Issue
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="requests" className="space-y-4">
                        <Card className="rounded-lg">
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Employee</TableHead>
                                            <TableHead>Request Type</TableHead>
                                            <TableHead>Asset Category</TableHead>
                                            <TableHead>Urgency</TableHead>
                                            <TableHead>Budget</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {assetRequests.map((request) => (
                                            <TableRow key={request.id} className="hover:bg-slate-50">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                                                                {request.employeeName.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{request.employeeName}</div>
                                                            <div className="text-sm text-muted-foreground">{request.department}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {request.requestType}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(request.assetCategory)}
                                                        <span className="capitalize">{request.assetCategory}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                                                <TableCell className="font-medium">{formatCurrency(request.budget)}</TableCell>
                                                <TableCell>{getRequestStatusBadge(request.status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Request
                                                            </DropdownMenuItem>
                                                            {request.status === 'pending' && (
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="maintenance" className="space-y-4">
                        <Card className="rounded-lg mt-4">
                            <CardContent className="p-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Settings className="h-8 w-8 text-orange-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-slate-700 dark:text-muted-foreground mb-2">Asset Maintenance Tracking</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Schedule and track maintenance activities for all assets</p>
                                    <Button className="bg-transparent border border-brand-accent text-brand-accent">
                                        <Plus className=" h-4 w-4" />
                                        Schedule Maintenance
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="rounded-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        <p className="text-laj font-bold">Asset Category Distribution</p>
                                    </CardTitle>
                                    <CardDescription className="text-slate-900 dark:text-slate-100">Assets by category and value</CardDescription>
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
                                    <CardDescription className="text-slate-900 dark:text-slate-100">Asset purchases, retirements, and maintenance</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <ChartContainer config={chartConfig} className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={monthlyAssetData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="purchased" stroke="var(--color-purchased)" strokeWidth={2} />
                                                <Line type="monotone" dataKey="retired" stroke="var(--color-retired)" strokeWidth={2} />
                                                <Line type="monotone" dataKey="maintenance" stroke="var(--color-maintenance)" strokeWidth={2} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {showAssetDialog && selectedAsset && (
                    <AssetSheet
                        assetDialogDraft={selectedAsset}
                        setAssetDialogDraft={setSelectedAsset}
                        isView={true}
                        assetDialogOpen={showAssetDialog}
                        onOpenChange={setShowAssetDialog}
                        assetDialogMode="view"
                        defaultDraft={selectedAsset}
                    />
                )}
            </div>
        </div>
    )
}