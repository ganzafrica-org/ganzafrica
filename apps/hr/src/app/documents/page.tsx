"use client"

import React, {useEffect, useMemo, useState} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Plus,
    Search,
    Filter,
    SlidersHorizontal,
    Download,
    Eye,
    Edit,
    Trash2,
    Upload,
    FileText,
    File,
    Image,
    Video,
    Archive,
    Lock,
    Share,
    MoreVertical,
    Folder,
    TrendingUp,
    Clock
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ReusableSheet } from '@/components/sections/sheets/sheet-component'
import { DataTable, ColumnDef } from "@/components/sections/table-component"
import { DocumentSheet } from '@/components/sections/sheets/document-sheet'
import {documentCategories, documents} from "@/data/documents-data";
import {StatsHeader} from "@/components/sections/header";
import {DocumentStats} from "@/data/Header-data";

export default function DocumentManagementPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [hidden, setHidden] = useState<Set<string>>(new Set())
    const [selectedDocument, setSelectedDocument] = useState<any>(null)
    const [isViewing, setIsViewing] = useState(false)

    const documentColumns: ColumnDef<any>[] = [
        {
            key: "name",
            header: "Document",
            sortable: true,
            render: (_, doc) => (
                <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded">
                        {getFileIcon(doc.type)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{doc.name}</span>
                            {doc.restricted && <Lock className="h-3 w-3 text-amber-500" />}
                            {doc.requiresSignature && <FileText className="h-3 w-3 text-blue-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{doc.size}</p>
                    </div>
                </div>
            )
        },
        {
            key: "category",
            header: "Category",
            sortable: true,
            render: (category) => (
                <Badge variant="outline" className="capitalize">
                    {documentCategories.find(c => c.id === category)?.name}
                </Badge>
            )
        },
        {
            key: "version",
            header: "Version",
            sortable: true,
            render: (v) => <span className="text-sm font-medium">v{v}</span>
        },
        {
            key: "lastModified",
            header: "Modified",
            sortable: true,
            render: (date) => <span className="text-sm">{new Date(date).toLocaleDateString()}</span>
        },
        {
            key: "downloads",
            header: "Downloads",
            sortable: true,
            render: (downloads) => (
                <div className="flex items-center gap-1">
                    <Download className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{downloads}</span>
                </div>
            )
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (status) => getStatusBadge(status)
        },
        {
            key: "actions",
            header: "Actions",
            render: (_, doc) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                            setSelectedDocument(doc)
                            setIsViewing(true)
                            setShowUploadDialog(true)
                        }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                            setSelectedDocument(doc)
                            setIsViewing(false)
                            setShowUploadDialog(true)
                        }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    const toggleColumn = (key: string) => {
        setHidden(prev => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const visibleColumns = useMemo(() => 
        documentColumns.filter(col => !hidden.has(col.key)), 
        [hidden]
    )

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter
        const matchesStatus = statusFilter === "all" || doc.status === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
    })

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="h-4 w-4 text-red-600" />
            case 'docx':
            case 'doc':
                return <File className="h-4 w-4 text-blue-600" />
            case 'xlsx':
            case 'xls':
                return <File className="h-4 w-4 text-green-600" />
            case 'jpg':
            case 'png':
            case 'gif':
                return <Image className="h-4 w-4 text-purple-600" />
            case 'mp4':
            case 'avi':
                return <Video className="h-4 w-4 text-orange-600" />
            default:
                return <File className="h-4 w-4 text-gray-600" />
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-green-100 text-green-800">Published</Badge>
            case 'draft':
                return <Badge className="bg-orange-100 text-orange-800">Draft</Badge>
            case 'archived':
                return <Badge className="bg-slate-100 text-slate-800">Archived</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }
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

    return (
        <div className="min-h-screen flex flex-col w-full bg-[#f6f8fb] dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="space-y-6">

                <StatsHeader
                    title="Documents"
                    subtitle="Manage GanzAfrica Documents"
                    scrolled={scrolled}
                    stats={DocumentStats}
                    ClassName="w-full"
                />
                <Tabs defaultValue="documents" className="w-full flex flex-col">
                    <TabsList className="h-auto w-fit gap-1 rounded-xl bg-slate-200 p-1.5">
                        <TabsTrigger
                            value="documents"
                            className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            <FileText className="size-4 shrink-0" />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger
                            value="categories"
                            className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            <Folder className="size-4 shrink-0" />
                            Categories
                        </TabsTrigger>
                        <TabsTrigger
                            value="analytics"
                            className="inline-flex items-center gap-2 rounded-lg border-0 bg-transparent px-4 py-2.5 text-sm font-medium text-slate-600 shadow-none transition-all duration-200 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                        >
                            <TrendingUp className="size-4 shrink-0" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="space-y-4">
                        <Card className="rounded-lg">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search documents..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                            />
                                        </div>
                                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                            <SelectTrigger className="w-[200px] border-slate-200">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                {documentCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[150px] border-slate-200">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="archived">Archived</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        {/* Column visibility dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2 h-9 ml-auto">
                                                    <SlidersHorizontal className="h-4 w-4" />
                                                    Columns
                                                    {hidden.size > 0 && (
                                                        <Badge variant="secondary" className="px-1.5 text-xs">
                                                            {hidden.size}
                                                        </Badge>
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {documentColumns.map(col => (
                                                    <DropdownMenuCheckboxItem
                                                        key={col.key}
                                                        checked={!hidden.has(col.key)}
                                                        onCheckedChange={() => toggleColumn(col.key)}
                                                        className="capitalize"
                                                    >
                                                        {col.header}
                                                    </DropdownMenuCheckboxItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                        <Button
                                            variant="outline"
                                            className="bg-transparent border border-brand-accent text-brand-accent hover:bg-brand-accent hover:text-white h-full py-3"
                                            onClick={() => {
                                                setSelectedDocument(null)
                                                setIsViewing(false)
                                                setShowUploadDialog(true)
                                            }}
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Document
                                        </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <DataTable
                            columns={visibleColumns}
                            data={filteredDocuments}
                            onRowClick={(doc) => {
                                setSelectedDocument(doc)
                                setIsViewing(true)
                                setShowUploadDialog(true)
                            }}
                            searchable={false}
                        />
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {documentCategories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <Card key={category.id} className="hover:shadow-md transition-all duration-300 rounded-lg">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-3 rounded-lg ${category.color} shadow-sm`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg font-bold">{category.name}</CardTitle>
                                                        <CardDescription className="text-sm mt-1 text-slate-800">
                                                            {category.description}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                {category.restricted && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 rounded text-amber-700 text-xs">
                                                        <Lock className="h-3 w-3" />
                                                        Restricted
                                                    </div>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <FileText className="h-4 w-4" />
                                                    <span className="font-medium">{category.documents}</span> documents
                                                </div>
                                                <Button variant="outline" size="sm" className="rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="shadow-sm rounded-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        <p className="text-lg font-bold">Document Usage</p>
                                    </CardTitle>
                                    <CardDescription className="text-slate-700">Most accessed documents this month</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {documents
                                            .sort((a, b) => b.views - a.views)
                                            .slice(0, 5)
                                            .map((doc, index) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                            #{index + 1}
                                                        </div>
                                                        {getFileIcon(doc.type)}
                                                        <div>
                                                            <p className="text-sm font-medium">{doc.name}</p>
                                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Eye className="h-3 w-3" />
                                                                {doc.views} views
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {doc.downloads} downloads
                                                    </Badge>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm rounded-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Archive className="h-5 w-5 text-purple-600" />
                                        <p className="text-lg font-bold">Category Distribution</p>
                                    </CardTitle>
                                    <CardDescription className="text-slate-700">Documents by category</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {documentCategories.map((category) => {
                                            const categoryDocs = documents.filter(doc => doc.category === category.id)
                                            const percentage = (categoryDocs.length / documents.length) * 100
                                            const Icon = category.icon
                                            return (
                                                <div key={category.id} className="space-y-2">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                                            <span>{category.name}</span>
                                                        </div>
                                                        <span className="font-medium">{categoryDocs.length} docs</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="shadow-sm rounded-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    <p className="text-lg font-bold">Recent Activity</p>
                                </CardTitle>
                                <CardDescription className="text-slate-700">Latest document activities</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[
                                        { action: 'uploaded', user: 'Sarah Johnson', document: 'Employee Handbook 2024', time: '2 hours ago', type: 'upload', color: 'bg-green-100 text-green-600' },
                                        { action: 'signed', user: 'Alice Uwimana', document: 'Code of Conduct', time: '4 hours ago', type: 'signature', color: 'bg-blue-100 text-blue-600' },
                                        { action: 'downloaded', user: 'David Nshimiyimana', document: 'Data Protection Policy', time: '6 hours ago', type: 'download', color: 'bg-purple-100 text-purple-600' },
                                        { action: 'updated', user: 'Michael Brown', document: 'Standard Employment Contract', time: '1 day ago', type: 'edit', color: 'bg-orange-100 text-orange-600' }
                                    ].map((activity, index) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                            <div className={`p-2 rounded-full ${activity.color}`}>
                                                {activity.type === 'upload' && <Upload className="h-4 w-4" />}
                                                {activity.type === 'signature' && <FileText className="h-4 w-4" />}
                                                {activity.type === 'download' && <Download className="h-4 w-4" />}
                                                {activity.type === 'edit' && <Edit className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm">
                                                    <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                                                    <span className="font-medium">{activity.document}</span>
                                                </p>
                                                <p className="text-xs text-muted-foreground">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {showUploadDialog && (
                    <ReusableSheet
                        open={showUploadDialog}
                        onOpenChange={setShowUploadDialog}
                        title={isViewing ? "View Document Details" : selectedDocument ? "Edit Document" : "Upload New Document"}
                        footer={
                            <div className="flex w-full gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-200 text-slate-600 hover:bg-white"
                                    onClick={() => setShowUploadDialog(false)}
                                >
                                    Cancel
                                </Button>
                                {!isViewing && (
                                    <Button className="flex-1 bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white shadow-md">
                                        <Upload className="mr-2 h-4 w-4" />
                                        {selectedDocument ? "Save Changes" : "Upload Document"}
                                    </Button>
                                )}
                            </div>
                        }
                    >
                        {isViewing && selectedDocument ? (
                            <DocumentSheet documentName={selectedDocument.name} revisions={selectedDocument.revisions || []} />
                        ) : (
                            <div className="p-6 space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="docName" className="text-sm font-medium">Document Name *</Label>
                                        <Input id="docName" defaultValue={selectedDocument?.name} placeholder="e.g., Employee Handbook 2024" className="border-slate-200 focus:border-blue-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="version" className="text-sm font-medium">Version</Label>
                                        <Input id="version" defaultValue={selectedDocument?.version} placeholder="e.g., 1.0" className="border-slate-200 focus:border-blue-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                    <Textarea
                                        id="description"
                                        defaultValue={selectedDocument?.description}
                                        placeholder="Brief description of the document..."
                                        rows={3}
                                        className="border-slate-200 focus:border-blue-400"
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                                        <Select defaultValue={selectedDocument?.category}>
                                            <SelectTrigger className="border-slate-200">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentCategories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="departments" className="text-sm font-medium">Departments</Label>
                                        <Select>
                                            <SelectTrigger className="border-slate-200">
                                                <SelectValue placeholder="Select departments" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Departments</SelectItem>
                                                <SelectItem value="hr">HR</SelectItem>
                                                <SelectItem value="agriculture">Agriculture</SelectItem>
                                                <SelectItem value="environment">Environment</SelectItem>
                                                <SelectItem value="fellowship">Fellowship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Tags</Label>
                                    <Input defaultValue={selectedDocument?.tags?.join(', ')} placeholder="Enter tags separated by commas" className="border-slate-200 focus:border-blue-400" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Document File *</Label>
                                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                                        <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                                        <div className="text-sm">
                                            <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                                                Click to upload
                                            </label>
                                            <span className="text-gray-500"> or drag and drop</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, XLS, XLSX (max. 25MB)</p>
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                                    <h4 className="font-medium text-slate-700">Document Settings</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="restricted" defaultChecked={selectedDocument?.restricted} />
                                            <Label htmlFor="restricted" className="text-sm">
                                                Restricted access (only specific roles can view)
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="signature" defaultChecked={selectedDocument?.requiresSignature} />
                                            <Label htmlFor="signature" className="text-sm">
                                                Requires digital signature
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="onboarding" />
                                            <Label htmlFor="onboarding" className="text-sm">
                                                Include in onboarding templates
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </ReusableSheet>
                )}
            </div>
        </div>
    )
}