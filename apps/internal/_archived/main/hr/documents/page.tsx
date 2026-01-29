"use client"

import React, { useState } from 'react'
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
    Users,
    Lock,
    Share,
    MoreVertical,
    Folder,
    FolderPlus,
    CheckCircle,
    TrendingUp,
    Building, Clock
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
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

const documentCategories = [
    {
        id: 'policies',
        name: 'Policies & Procedures',
        description: 'Company policies, procedures, and guidelines',
        icon: FileText,
        color: 'bg-blue-100 text-blue-800',
        documents: 23,
        restricted: false
    },
    {
        id: 'contracts',
        name: 'Contract Templates',
        description: 'Employment contracts and legal templates',
        icon: File,
        color: 'bg-green-100 text-green-800',
        documents: 12,
        restricted: true
    },
    {
        id: 'forms',
        name: 'Forms & Applications',
        description: 'Standard forms and application templates',
        icon: FileText,
        color: 'bg-purple-100 text-purple-800',
        documents: 18,
        restricted: false
    },
    {
        id: 'onboarding',
        name: 'Onboarding Materials',
        description: 'Welcome guides, checklists, and orientation materials',
        icon: Users,
        color: 'bg-orange-100 text-orange-800',
        documents: 15,
        restricted: false
    },
    {
        id: 'compliance',
        name: 'Compliance & Legal',
        description: 'Legal documents, compliance requirements',
        icon: Lock,
        color: 'bg-red-100 text-red-800',
        documents: 8,
        restricted: true
    },
    {
        id: 'training',
        name: 'Training Materials',
        description: 'Training guides, presentations, and resources',
        icon: Archive,
        color: 'bg-yellow-100 text-yellow-800',
        documents: 31,
        restricted: false
    }
]

const documents = [
    {
        id: 1,
        name: 'Employee Handbook 2024',
        description: 'Comprehensive guide for all employees covering policies, benefits, and procedures',
        category: 'policies',
        type: 'pdf',
        size: '2.4 MB',
        version: '3.2',
        uploadedBy: 'Sarah Johnson',
        uploadedDate: '2024-12-01',
        lastModified: '2024-12-05',
        downloads: 156,
        views: 423,
        status: 'published',
        restricted: false,
        requiresSignature: false,
        tags: ['handbook', 'policies', 'general'],
        departments: ['All']
    },
    {
        id: 2,
        name: 'Standard Employment Contract',
        description: 'Template for full-time employment contracts',
        category: 'contracts',
        type: 'docx',
        size: '156 KB',
        version: '2.1',
        uploadedBy: 'Michael Brown',
        uploadedDate: '2024-11-15',
        lastModified: '2024-11-20',
        downloads: 45,
        views: 89,
        status: 'published',
        restricted: true,
        requiresSignature: true,
        tags: ['contract', 'employment', 'legal'],
        departments: ['HR', 'Legal']
    },
    {
        id: 3,
        name: 'Fellowship Agreement Template',
        description: 'Contract template for fellowship positions',
        category: 'contracts',
        type: 'docx',
        size: '142 KB',
        version: '1.5',
        uploadedBy: 'Grace Mukamana',
        uploadedDate: '2024-11-10',
        lastModified: '2024-11-25',
        downloads: 23,
        views: 67,
        status: 'published',
        restricted: true,
        requiresSignature: true,
        tags: ['fellowship', 'contract', 'legal'],
        departments: ['HR', 'Fellowship']
    },
    {
        id: 4,
        name: 'Code of Conduct',
        description: 'Ethical guidelines and behavioral expectations',
        category: 'policies',
        type: 'pdf',
        size: '890 KB',
        version: '1.0',
        uploadedBy: 'Jean Baptiste Mukamana',
        uploadedDate: '2024-10-20',
        lastModified: '2024-10-20',
        downloads: 234,
        views: 567,
        status: 'published',
        restricted: false,
        requiresSignature: true,
        tags: ['ethics', 'conduct', 'policies'],
        departments: ['All']
    },
    {
        id: 5,
        name: 'New Employee Checklist',
        description: 'Complete checklist for onboarding new employees',
        category: 'onboarding',
        type: 'pdf',
        size: '245 KB',
        version: '2.0',
        uploadedBy: 'Alice Uwimana',
        uploadedDate: '2024-12-03',
        lastModified: '2024-12-03',
        downloads: 78,
        views: 145,
        status: 'published',
        restricted: false,
        requiresSignature: false,
        tags: ['onboarding', 'checklist', 'new-hire'],
        departments: ['HR', 'All Managers']
    },
    {
        id: 6,
        name: 'Data Protection Policy',
        description: 'Guidelines for handling personal and sensitive data',
        category: 'compliance',
        type: 'pdf',
        size: '1.2 MB',
        version: '1.3',
        uploadedBy: 'David Nshimiyimana',
        uploadedDate: '2024-11-30',
        lastModified: '2024-12-02',
        downloads: 89,
        views: 201,
        status: 'published',
        restricted: true,
        requiresSignature: true,
        tags: ['data-protection', 'privacy', 'compliance'],
        departments: ['All']
    }
]

const onboardingTemplates = [
    {
        id: 'general-onboarding',
        name: 'General Employee Onboarding',
        description: 'Standard onboarding template for all employees',
        documents: [
            { name: 'Employee Handbook', required: true, signature: true },
            { name: 'Code of Conduct', required: true, signature: true },
            { name: 'IT Usage Policy', required: true, signature: true },
            { name: 'Emergency Contacts Form', required: true, signature: false },
            { name: 'Bank Details Form', required: true, signature: false },
            { name: 'Benefits Overview', required: false, signature: false }
        ],
        departments: ['All'],
        estimatedTime: '2-3 hours'
    },
    {
        id: 'technical-onboarding',
        name: 'Technical Role Onboarding',
        description: 'Enhanced onboarding for technical positions',
        documents: [
            { name: 'Employee Handbook', required: true, signature: true },
            { name: 'Code of Conduct', required: true, signature: true },
            { name: 'IT Usage Policy', required: true, signature: true },
            { name: 'Data Protection Policy', required: true, signature: true },
            { name: 'Technical Guidelines', required: true, signature: false },
            { name: 'Equipment Checklist', required: true, signature: false },
            { name: 'Software Licenses Agreement', required: true, signature: true }
        ],
        departments: ['IT', 'Agriculture', 'Environment'],
        estimatedTime: '3-4 hours'
    },
    {
        id: 'fellowship-onboarding',
        name: 'Fellowship Onboarding',
        description: 'Specialized onboarding for fellows',
        documents: [
            { name: 'Fellowship Agreement', required: true, signature: true },
            { name: 'Program Guidelines', required: true, signature: false },
            { name: 'Code of Conduct', required: true, signature: true },
            { name: 'Mentor Assignment', required: false, signature: false },
            { name: 'Project Guidelines', required: true, signature: false }
        ],
        departments: ['Fellowship'],
        estimatedTime: '1-2 hours'
    }
]

export default function DocumentManagementPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [showUploadDialog, setShowUploadDialog] = useState(false)
    const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false)

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

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Document Management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage policies, contracts, forms and onboarding materials
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <FolderPlus className="mr-2 h-4 w-4" />
                            New Category
                        </Button>
                        <Button onClick={() => setShowUploadDialog(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                        </Button>
                    </div>
                </div>

                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Total Documents</CardTitle>
                            <FileText className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{documents.length}</div>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="text-blue-200">+5</span> this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Categories</CardTitle>
                            <Folder className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{documentCategories.length}</div>
                            <p className="text-xs text-purple-100">Document categories</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Downloads</CardTitle>
                            <Download className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {documents.reduce((sum, doc) => sum + doc.downloads, 0)}
                            </div>
                            <p className="text-xs text-emerald-100">Total downloads</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-orange-100">Onboarding Templates</CardTitle>
                            <Users className="h-5 w-5 text-orange-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{onboardingTemplates.length}</div>
                            <p className="text-xs text-orange-100">Active templates</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="documents" className="space-y-4">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="documents" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="categories" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <Folder className="h-4 w-4 mr-2" />
                            Categories
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="space-y-4">
                        
                        <Card>
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
                                    </div>
                                    <Button variant="outline">
                                        <Filter className="h-4 w-4" />
                                        More Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Archive className="h-5 w-5 text-blue-600" />
                                    Document Library
                                </CardTitle>
                                <CardDescription>
                                    Browse and manage all organizational documents
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Document</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Modified</TableHead>
                                            <TableHead>Downloads</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[70px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredDocuments.map((doc) => (
                                            <TableRow key={doc.id} className="hover:bg-slate-50">
                                                <TableCell>
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
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        {documentCategories.find(c => c.id === doc.category)?.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">v{doc.version}</TableCell>
                                                <TableCell className="text-sm">{new Date(doc.lastModified).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Download className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{doc.downloads}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem>
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
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="categories" className="space-y-4">
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {documentCategories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <Card key={category.id} className="hover:shadow-md transition-all duration-300 ">
                                        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-3 rounded-lg ${category.color} shadow-sm`}>
                                                        <Icon className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{category.name}</CardTitle>
                                                        <CardDescription className="text-sm mt-1">
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
                                                <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                                    <Eye className="mr-1 h-3 w-3" />
                                                    View All
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
                            
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                                        Document Usage
                                    </CardTitle>
                                    <CardDescription>Most accessed documents this month</CardDescription>
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

                            
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <Archive className="h-5 w-5 text-purple-600" />
                                        Category Distribution
                                    </CardTitle>
                                    <CardDescription>Documents by category</CardDescription>
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

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    Recent Activity
                                </CardTitle>
                                <CardDescription>Latest document activities</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {[
                                        {
                                            action: 'uploaded',
                                            user: 'Sarah Johnson',
                                            document: 'Employee Handbook 2024',
                                            time: '2 hours ago',
                                            type: 'upload',
                                            color: 'bg-green-100 text-green-600'
                                        },
                                        {
                                            action: 'signed',
                                            user: 'Alice Uwimana',
                                            document: 'Code of Conduct',
                                            time: '4 hours ago',
                                            type: 'signature',
                                            color: 'bg-blue-100 text-blue-600'
                                        },
                                        {
                                            action: 'downloaded',
                                            user: 'David Nshimiyimana',
                                            document: 'Data Protection Policy',
                                            time: '6 hours ago',
                                            type: 'download',
                                            color: 'bg-purple-100 text-purple-600'
                                        },
                                        {
                                            action: 'updated',
                                            user: 'Michael Brown',
                                            document: 'Standard Employment Contract',
                                            time: '1 day ago',
                                            type: 'edit',
                                            color: 'bg-orange-100 text-orange-600'
                                        }
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
                                                    <span className="font-medium">{activity.user}</span> {activity.action} {' '}
                                                    <span className="font-medium">"{activity.document}"</span>
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

                
                <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Upload className="h-5 w-5 text-blue-600" />
                                Upload New Document
                            </DialogTitle>
                            <DialogDescription>
                                Add a new document to the knowledge base
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="docName" className="text-sm font-medium">Document Name *</Label>
                                    <Input id="docName" placeholder="e.g., Employee Handbook 2024" className="border-slate-200 focus:border-blue-400" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="version" className="text-sm font-medium">Version</Label>
                                    <Input id="version" placeholder="e.g., 1.0" className="border-slate-200 focus:border-blue-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief description of the document..."
                                    rows={3}
                                    className="border-slate-200 focus:border-blue-400"
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                                    <Select>
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
                                <Input placeholder="Enter tags separated by commas" className="border-slate-200 focus:border-blue-400" />
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
                                        <Checkbox id="restricted" />
                                        <Label htmlFor="restricted" className="text-sm">
                                            Restricted access (only specific roles can view)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="signature" />
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
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                                Cancel
                            </Button>
                            <Button className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}