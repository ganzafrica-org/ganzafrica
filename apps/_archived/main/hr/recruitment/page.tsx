"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Plus,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Users,
    Calendar,
    MapPin,
    Clock,
    DollarSign,
    FileText,
    CheckCircle,
    XCircle,
    TrendingUp,
    Star,
    Building
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Link from "next/link"
import { useRouter } from "next/navigation"

const jobPostings = [
    {
        id: 1,
        title: "Senior Agricultural Specialist",
        department: "Agriculture",
        type: "employment",
        status: "published",
        applications: 23,
        location: "Kigali, Rwanda",
        salary: "$40,000 - $55,000",
        posted: "2024-12-01",
        closes: "2024-12-31",
        description: "Lead agricultural development projects focusing on sustainable farming practices and food security initiatives across Rwanda.",
        requirements: [
            "Master's degree in Agriculture or related field",
            "Minimum 5 years of experience in agricultural development",
            "Strong knowledge of sustainable farming practices",
            "Experience working with rural communities in East Africa"
        ],
        responsibilities: [
            "Lead agricultural development projects across multiple districts",
            "Develop and implement sustainable farming strategies",
            "Train and mentor local farmers and agricultural extension officers"
        ],
        benefits: [
            "Competitive salary and benefits package",
            "Professional development opportunities",
            "Health insurance coverage"
        ]
    },
    {
        id: 2,
        title: "Youth Fellow - Environment",
        department: "Fellowship Program",
        type: "fellowship",
        status: "published",
        applications: 45,
        location: "Multiple Locations",
        salary: "Stipend provided",
        posted: "2024-12-05",
        closes: "2024-12-25",
        description: "12-month fellowship program focusing on environmental conservation and climate change adaptation in rural communities.",
        requirements: [
            "Bachelor's degree in Environmental Science or related field",
            "Passion for environmental conservation",
            "Willingness to work in rural communities"
        ],
        responsibilities: [
            "Implement environmental conservation projects",
            "Engage with local communities on climate adaptation",
            "Collect and analyze environmental data"
        ],
        benefits: [
            "Monthly stipend",
            "Training and mentorship",
            "Career development opportunities"
        ]
    },
    {
        id: 3,
        title: "Land Management Coordinator",
        department: "Land Management",
        type: "employment",
        status: "draft",
        applications: 0,
        location: "Musanze, Rwanda",
        salary: "$35,000 - $45,000",
        posted: "2024-12-08",
        closes: "2025-01-15",
        description: "Coordinate land use planning and management activities in northern Rwanda provinces.",
        requirements: [],
        responsibilities: [],
        benefits: []
    },
    {
        id: 4,
        title: "Communications Officer",
        department: "Administration",
        type: "employment",
        status: "closed",
        applications: 67,
        location: "Kigali, Rwanda",
        salary: "$30,000 - $40,000",
        posted: "2024-11-15",
        closes: "2024-12-10",
        description: "Manage organizational communications, social media, and stakeholder engagement activities.",
        requirements: [],
        responsibilities: [],
        benefits: []
    }
]

const recentApplications = [
    {
        id: 1,
        jobTitle: "Senior Agricultural Specialist",
        applicantName: "Jean Baptiste Uwimana",
        email: "jean.uwimana@email.com",
        status: "interview_scheduled",
        appliedDate: "2024-12-08",
        stage: "Technical Interview",
        experience: "5 years",
        education: "Master's in Agriculture"
    },
    {
        id: 2,
        jobTitle: "Youth Fellow - Environment",
        applicantName: "Grace Mukamana",
        email: "grace.mukamana@email.com",
        status: "under_review",
        appliedDate: "2024-12-07",
        stage: "CV Screening",
        experience: "2 years",
        education: "Bachelor's in Environmental Science"
    },
    {
        id: 3,
        jobTitle: "Senior Agricultural Specialist",
        applicantName: "David Nshimiyimana",
        email: "david.nshimiyimana@email.com",
        status: "shortlisted",
        appliedDate: "2024-12-06",
        stage: "HR Interview",
        experience: "7 years",
        education: "PhD in Agricultural Economics"
    },
    {
        id: 4,
        jobTitle: "Communications Officer",
        applicantName: "Marie Claire Umutoni",
        email: "marie.umutoni@email.com",
        status: "rejected",
        appliedDate: "2024-12-05",
        stage: "Final Decision",
        experience: "3 years",
        education: "Bachelor's in Communications"
    }
]

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Published</Badge>
        case 'draft':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">Draft</Badge>
        case 'closed':
            return <Badge className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200">Closed</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getApplicationStatusBadge = (status: string) => {
    switch (status) {
        case 'under_review':
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">Under Review</Badge>
        case 'interview_scheduled':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">Interview Scheduled</Badge>
        case 'shortlisted':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Shortlisted</Badge>
        case 'rejected':
            return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200">Rejected</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
        case 'agriculture':
            return 'bg-emerald-50 border-emerald-200 text-emerald-800'
        case 'fellowship program':
            return 'bg-blue-50 border-blue-200 text-blue-800'
        case 'land management':
            return 'bg-amber-50 border-amber-200 text-amber-800'
        case 'administration':
            return 'bg-purple-50 border-purple-200 text-purple-800'
        default:
            return 'bg-slate-50 border-slate-200 text-slate-800'
    }
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'employment':
            return <Building className="h-3 w-3" />
        case 'fellowship':
            return <Star className="h-3 w-3" />
        default:
            return <FileText className="h-3 w-3" />
    }
}

export default function RecruitmentPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")

    const filteredJobs = jobPostings.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || job.status === statusFilter
        const matchesType = typeFilter === "all" || job.type === typeFilter
        return matchesSearch && matchesStatus && matchesType
    })

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            
            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Active Jobs</CardTitle>
                        <FileText className="h-5 w-5 text-emerald-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            3 new this week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Applications</CardTitle>
                        <Users className="h-5 w-5 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">135</div>
                        <p className="text-xs text-blue-100 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            +23 from last week
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Interviews Scheduled</CardTitle>
                        <Calendar className="h-5 w-5 text-amber-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">8</div>
                        <p className="text-xs text-amber-100">This week</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Avg. Time to Hire</CardTitle>
                        <Clock className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">21</div>
                        <p className="text-xs text-purple-100">Days</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="jobs" className="space-y-6">
                <TabsList className="bg-white shadow-sm border w-full">
                    <TabsTrigger value="jobs" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                        Job Postings
                    </TabsTrigger>
                    <TabsTrigger value="applications" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                        Recent Applications
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-6">
                    
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search jobs..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-[150px] border-slate-200">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                                        <SelectTrigger className="w-[150px] border-slate-200">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="employment">Employment</SelectItem>
                                            <SelectItem value="fellowship">Fellowship</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button asChild className=" hover:shadow-md transition-all duration-300">
                                    <Link href="/hr/recruitment/new">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Post New Job
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredJobs.map((job) => (
                            <Card key={job.id} className="group hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1" onClick={() => router.push(`/hr/recruitment/${job.id}`)}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2 flex-1">
                                            <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                                                {job.title}
                                            </CardTitle>
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getDepartmentColor(job.department)}`}>
                                                {getTypeIcon(job.type)}
                                                {job.department}
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                                    <span className="text-red-600">Delete</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(job.status)}
                                        <Badge variant="outline" className="capitalize border-slate-200">
                                            {job.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </p>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin className="h-4 w-4 text-emerald-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <DollarSign className="h-4 w-4 text-blue-500" />
                                            {job.salary}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Users className="h-4 w-4 text-amber-500" />
                                            {job.applications} applications
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                            Closes: {new Date(job.closes).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-3">
                                        <Button variant="outline" size="sm" className="flex-1 border-green-primary text-green-primary hover:bg-green-primary hover:text-white" onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/hr/recruitment/${job.id}`)
                                        }}>
                                            <Eye className="mr-1 h-3 w-3" />
                                            View
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white" onClick={(e) => {
                                            e.stopPropagation()
                                            router.push(`/hr/recruitment/${job.id}/applications`)
                                        }}>
                                            <Users className="mr-1 h-3 w-3" />
                                            Applications ({job.applications})
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="applications" className="space-y-6">
                    <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                            <CardTitle className="text-xl text-slate-800">Recent Applications</CardTitle>
                            <CardDescription>Latest applications across all job postings</CardDescription>
                        </CardHeader>
                        <CardContent className="px-2">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-slate-100">
                                        <TableHead className="text-slate-700 font-semibold">Applicant</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Position</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Applied Date</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentApplications.map((application) => (
                                        <TableRow key={application.id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-slate-900">{application.applicantName}</div>
                                                    <div className="text-sm text-slate-500">{application.email}</div>
                                                    <div className="text-xs text-slate-400 mt-1">
                                                        {application.experience} • {application.education}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-700">{application.jobTitle}</TableCell>
                                            <TableCell className="text-slate-600">{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{getApplicationStatusBadge(application.status)}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => {
                                                            const job = jobPostings.find(j => j.title === application.jobTitle)
                                                            if (job) {
                                                                router.push(`/hr/recruitment/${job.id}/applications`)
                                                            }
                                                        }}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Application
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <CheckCircle className="mr-2 h-4 w-4" />
                                                            Move to Next Stage
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Calendar className="mr-2 h-4 w-4" />
                                                            Schedule Interview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <XCircle className="mr-2 h-4 w-4" />
                                                            Reject
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
            </Tabs>
        </div>
    )
}