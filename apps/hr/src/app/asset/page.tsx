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

const assetsData = [
    {
        id: 1,
        assetTag: "GZ-LT-001",
        name: "Dell Latitude 5520",
        category: "laptop",
        brand: "Dell",
        model: "Latitude 5520",
        serialNumber: "DL5520001",
        purchaseDate: "2024-01-15",
        purchasePrice: 1200,
        currentValue: 900,
        warranty: "2026-01-15",
        status: "assigned",
        condition: "excellent",
        location: "Kigali Office",
        assignedTo: "Jean Baptiste Mukamana",
        assignedDate: "2024-01-20",
        department: "Human Resources",
        specifications: {
            processor: "Intel i7-11th Gen",
            ram: "16GB DDR4",
            storage: "512GB SSD",
            screen: "15.6 inch FHD"
        },
        maintenanceHistory: [
            { date: "2024-06-15", type: "Software Update", cost: 0, notes: "OS and security updates" }
        ]
    },
    {
        id: 2,
        assetTag: "GZ-LT-002",
        name: "MacBook Pro 16",
        category: "laptop",
        brand: "Apple",
        model: "MacBook Pro 16-inch",
        serialNumber: "MBP16002",
        purchaseDate: "2024-02-01",
        purchasePrice: 2500,
        currentValue: 2000,
        warranty: "2026-02-01",
        status: "assigned",
        condition: "excellent",
        location: "Musanze Office",
        assignedTo: "Marie Claire Nsengimana",
        assignedDate: "2024-02-05",
        department: "Agriculture",
        specifications: {
            processor: "Apple M2 Pro",
            ram: "32GB Unified Memory",
            storage: "1TB SSD",
            screen: "16.2 inch Retina"
        },
        maintenanceHistory: []
    },
    {
        id: 3,
        assetTag: "GZ-PH-001",
        name: "iPhone 14 Pro",
        category: "phone",
        brand: "Apple",
        model: "iPhone 14 Pro",
        serialNumber: "IP14P001",
        purchaseDate: "2024-03-10",
        purchasePrice: 1100,
        currentValue: 850,
        warranty: "2025-03-10",
        status: "assigned",
        condition: "good",
        location: "Kigali Office",
        assignedTo: "David Niyonkuru",
        assignedDate: "2024-03-15",
        department: "Fellowship Program",
        specifications: {
            storage: "256GB",
            screen: "6.1 inch Super Retina XDR",
            camera: "48MP Triple Camera",
            battery: "All-day battery life"
        },
        maintenanceHistory: []
    },
    {
        id: 4,
        assetTag: "GZ-MON-001",
        name: "Dell UltraSharp Monitor",
        category: "monitor",
        brand: "Dell",
        model: "U2722DE",
        serialNumber: "DU27001",
        purchaseDate: "2024-01-20",
        purchasePrice: 400,
        currentValue: 320,
        warranty: "2027-01-20",
        status: "available",
        condition: "excellent",
        location: "Storage Room",
        assignedTo: null,
        assignedDate: null,
        department: null,
        specifications: {
            size: "27 inch",
            resolution: "2560x1440 QHD",
            connectivity: "USB-C, HDMI, DisplayPort",
            features: "Height adjustable, Swivel"
        },
        maintenanceHistory: []
    },
    {
        id: 5,
        assetTag: "GZ-LT-003",
        name: "HP EliteBook 850",
        category: "laptop",
        brand: "HP",
        model: "EliteBook 850 G8",
        serialNumber: "HP850003",
        purchaseDate: "2023-11-15",
        purchasePrice: 1300,
        currentValue: 750,
        warranty: "2025-11-15",
        status: "maintenance",
        condition: "fair",
        location: "IT Department",
        assignedTo: null,
        assignedDate: null,
        department: null,
        specifications: {
            processor: "Intel i7-10th Gen",
            ram: "16GB DDR4",
            storage: "256GB SSD",
            screen: "15.6 inch FHD"
        },
        maintenanceHistory: [
            { date: "2024-12-10", type: "Hardware Repair", cost: 200, notes: "Keyboard replacement" }
        ]
    }
]

const assetRequests = [
    {
        id: 1,
        employeeId: "GZ006",
        employeeName: "Grace Mukamana",
        department: "Environment",
        requestType: "new",
        assetCategory: "laptop",
        justification: "Need laptop for field data collection and analysis",
        urgency: "medium",
        requestDate: "2024-12-08",
        status: "pending",
        approver: "Sarah Uwimana",
        budget: 1500
    },
    {
        id: 2,
        employeeId: "GZ007",
        employeeName: "Emmanuel Nshimiyimana",
        department: "Land Management",
        requestType: "replacement",
        assetCategory: "phone",
        justification: "Current phone has battery issues and poor camera quality",
        urgency: "low",
        requestDate: "2024-12-05",
        status: "approved",
        approver: "Sarah Uwimana",
        budget: 800
    },
    {
        id: 3,
        employeeId: "GZ003",
        employeeName: "David Niyonkuru",
        department: "Fellowship Program",
        requestType: "additional",
        assetCategory: "monitor",
        justification: "Need external monitor for better productivity",
        urgency: "low",
        requestDate: "2024-12-07",
        status: "pending",
        approver: "Grace Uwimana",
        budget: 300
    }
]

const assetCategoryData = [
    { category: "Laptops", count: 25, value: 28500, fill: "#10b981" },
    { category: "Phones", count: 18, value: 14400, fill: "#3b82f6" },
    { category: "Monitors", count: 15, value: 4800, fill: "#f59e0b" },
    { category: "Tablets", count: 8, value: 3200, fill: "#8b5cf6" },
    { category: "Other", count: 12, value: 2400, fill: "#ef4444" },
]

const assetConditionData = [
    { condition: "Excellent", count: 45, percentage: 58 },
    { condition: "Good", count: 25, percentage: 32 },
    { condition: "Fair", count: 6, percentage: 8 },
    { condition: "Poor", count: 2, percentage: 2 },
]

const monthlyAssetData = [
    { month: "Jul", purchased: 5, retired: 2, maintenance: 3 },
    { month: "Aug", purchased: 8, retired: 1, maintenance: 5 },
    { month: "Sep", purchased: 3, retired: 4, maintenance: 2 },
    { month: "Oct", purchased: 12, retired: 2, maintenance: 7 },
    { month: "Nov", purchased: 6, retired: 3, maintenance: 4 },
    { month: "Dec", purchased: 4, retired: 1, maintenance: 6 },
]

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
} satisfies ChartConfig

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'assigned':
            return <Badge className="bg-green-100 text-green-800">Assigned</Badge>
        case 'available':
            return <Badge className="bg-blue-100 text-blue-800">Available</Badge>
        case 'maintenance':
            return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>
        case 'retired':
            return <Badge className="bg-red-100 text-red-800">Retired</Badge>
        case 'lost':
            return <Badge className="bg-red-100 text-red-800">Lost</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getConditionBadge = (condition: string) => {
    switch (condition) {
        case 'excellent':
            return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
        case 'good':
            return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
        case 'fair':
            return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>
        case 'poor':
            return <Badge className="bg-red-100 text-red-800">Poor</Badge>
        default:
            return <Badge variant="outline">{condition}</Badge>
    }
}

const getRequestStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
        case 'approved':
            return <Badge className="bg-green-100 text-green-800">Approved</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
        case 'fulfilled':
            return <Badge className="bg-blue-100 text-blue-800">Fulfilled</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
        case 'high':
            return <Badge className="bg-red-100 text-red-800">High</Badge>
        case 'medium':
            return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
        case 'low':
            return <Badge className="bg-green-100 text-green-800">Low</Badge>
        default:
            return <Badge variant="outline">{urgency}</Badge>
    }
}

const getCategoryIcon = (category: string) => {
    switch (category) {
        case 'laptop':
            return <Laptop className="h-4 w-4" />
        case 'phone':
            return <Smartphone className="h-4 w-4" />
        case 'monitor':
            return <Monitor className="h-4 w-4" />
        default:
            return <Package className="h-4 w-4" />
    }
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
    }).format(amount)
}

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

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search assets..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px] border-slate-200">
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
                                            <SelectTrigger className="w-[150px] border-slate-200">
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
                                </div>
                            </CardContent>
                        </Card>


                        <Card>
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
                                                <TableCell>{getStatusBadge(asset.status)}</TableCell>
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
                        <Card>
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
                        <Card className="rounded-md mt-4">
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
                    <Dialog open={showAssetDialog} onOpenChange={setShowAssetDialog}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-600" />
                                    Asset Details - {selectedAsset.name}
                                </DialogTitle>
                                <DialogDescription>
                                    Complete information for {selectedAsset.assetTag}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                                            <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                                                <Package className="h-4 w-4" />
                                                Basic Information
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Asset Tag:</span>
                                                    <span className="font-medium">{selectedAsset.assetTag}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Name:</span>
                                                    <span className="font-medium">{selectedAsset.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Brand:</span>
                                                    <span className="font-medium">{selectedAsset.brand}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Model:</span>
                                                    <span className="font-medium">{selectedAsset.model}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Serial Number:</span>
                                                    <span className="font-medium">{selectedAsset.serialNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Category:</span>
                                                    <Badge variant="outline" className="capitalize">
                                                        {selectedAsset.category}
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
                                                <div className="flex justify-between">
                                                    <span>Status:</span>
                                                    {getStatusBadge(selectedAsset.status)}
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Condition:</span>
                                                    {getConditionBadge(selectedAsset.condition)}
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Location:</span>
                                                    <span className="font-medium">{selectedAsset.location}</span>
                                                </div>
                                                {selectedAsset.assignedTo && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>Assigned To:</span>
                                                            <span className="font-medium">{selectedAsset.assignedTo}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Department:</span>
                                                            <span className="font-medium">{selectedAsset.department}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Assigned Date:</span>
                                                            <span className="font-medium">{selectedAsset.assignedDate}</span>
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
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                            <div className="font-bold text-green-600 text-lg">{formatCurrency(selectedAsset.purchasePrice)}</div>
                                            <p className="text-muted-foreground">Purchase Price</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                            <div className="font-bold text-blue-600 text-lg">{formatCurrency(selectedAsset.currentValue)}</div>
                                            <p className="text-muted-foreground">Current Value</p>
                                        </div>
                                        <div className="text-center p-4 border rounded-lg bg-white bg-opacity-60">
                                            <div className="font-bold text-purple-600 text-lg">
                                                {Math.round(((selectedAsset.purchasePrice - selectedAsset.currentValue) / selectedAsset.purchasePrice) * 100)}%
                                            </div>
                                            <p className="text-muted-foreground">Depreciation</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div className="flex justify-between">
                                            <span>Purchase Date:</span>
                                            <span className="font-medium">{selectedAsset.purchaseDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Warranty Expires:</span>
                                            <span className="font-medium">{selectedAsset.warranty}</span>
                                        </div>
                                    </div>
                                </div>


                                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                                    <h4 className="font-medium text-purple-800 mb-4 flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Specifications
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {Object.entries(selectedAsset.specifications).map(([key, value]) => (
                                            <div key={key} className="flex justify-between p-2 bg-white bg-opacity-60 rounded">
                                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
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
                                    {selectedAsset.maintenanceHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedAsset.maintenanceHistory.map((maintenance: any, index: number) => (
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
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowAssetDialog(false)}>
                                    Close
                                </Button>
                                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Asset
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}