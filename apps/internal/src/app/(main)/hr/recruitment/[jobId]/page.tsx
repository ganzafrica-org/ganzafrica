"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    ArrowLeft,
    MapPin,
    DollarSign,
    Calendar,
    Users,
    Clock,
    Eye,
    Edit,
    Share,
    MoreVertical,
    CheckCircle,
    Building,
    Briefcase,
    FileText,
    Award,
    Settings,
    TrendingUp,
    UserCheck,
    Star,
    Target
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const jobData = {
    id: '1',
    title: "Senior Agricultural Specialist",
    department: "Agriculture",
    type: "employment",
    status: "published",
    applications: 23,
    location: "Kigali, Rwanda",
    salary: "$40,000 - $55,000",
    posted: "2024-12-01",
    closes: "2024-12-31",
    description: "Lead agricultural development projects focusing on sustainable farming practices and food security initiatives across Rwanda. This role involves working closely with rural communities, government agencies, and international development partners to implement sustainable agricultural solutions that enhance food security and improve livelihoods.",
    requirements: [
        "Master's degree in Agriculture or related field",
        "Minimum 5 years of experience in agricultural development",
        "Strong knowledge of sustainable farming practices",
        "Experience working with rural communities in East Africa",
        "Fluency in English and Kinyarwanda"
    ],
    responsibilities: [
        "Lead agricultural development projects across multiple districts",
        "Develop and implement sustainable farming strategies",
        "Train and mentor local farmers and agricultural extension officers",
        "Collaborate with government agencies and international partners",
        "Monitor and evaluate project outcomes and impact"
    ],
    benefits: [
        "Competitive salary and benefits package",
        "Professional development opportunities",
        "Health insurance coverage",
        "Annual performance bonus",
        "Flexible working arrangements"
    ],
    applicationForm: {
        personalInfo: true,
        education: true,
        experience: true,
        coverLetter: true,
        portfolio: false,
        references: true,
        customQuestions: [
            {
                id: '1',
                question: 'Describe your experience with sustainable farming practices',
                type: 'textarea',
                required: true
            },
            {
                id: '2',
                question: 'Rate your proficiency in Kinyarwanda',
                type: 'select',
                required: true,
                options: ['Beginner', 'Intermediate','Advanced', 'Native']
            }
        ]
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'published':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Published</Badge>
        case 'draft':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Draft</Badge>
        case 'closed':
            return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Closed</Badge>
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

export default function JobDetailsPage({ params }: { params: { jobId: string } }) {
    const router = useRouter()

    const handleViewApplications = () => {
        router.push(`/hr/recruitment/${params.jobId}/applications`)
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold bg-blue-secondary  bg-clip-text text-transparent">
                                    {jobData.title}
                                </h1>
                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getDepartmentColor(jobData.department)}`}>
                                    <Building className="h-3 w-3" />
                                    {jobData.department}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {getStatusBadge(jobData.status)}
                                <Badge variant="outline" className="capitalize border-slate-200">
                                    {jobData.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                    Posted {new Date(jobData.posted).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Share className=" h-4 w-4" />
                            Share
                        </Button>
                        <Button variant="outline" className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-medium text-emerald-100">Applications</CardTitle>
                            <Users className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-3xl font-bold">{jobData.applications}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Days Active</CardTitle>
                            <Clock className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-2xl font-bold">
                                {Math.ceil((new Date().getTime() - new Date(jobData.posted).getTime()) / (1000 * 3600 * 24))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Quality Score</CardTitle>
                            <TrendingUp className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-2xl font-bold">85%</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-sm transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Shortlisted</CardTitle>
                            <UserCheck className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="text-2xl font-bold">12</div>
                        </CardContent>
                    </Card>
                </div>

                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button
                                    onClick={handleViewApplications}
                                    className="w-full"
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    View Applications ({jobData.applications})
                                </Button>

                                <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Job Posting
                                </Button>

                                <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                                    <Share className="mr-2 h-4 w-4" />
                                    Share Job Link
                                </Button>

                                <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                                    <FileText className="mr-2 h-4 w-4" />
                                    Export Applications
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-blue-600" />
                                    Application Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Applications Today</span>
                                        <span className="font-semibold text-emerald-600">+3</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">This Week</span>
                                        <span className="font-semibold text-blue-600">+12</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Conversion Rate</span>
                                        <span className="font-semibold text-purple-600">15%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Avg. Time to Apply</span>
                                        <span className="font-semibold text-amber-600">8 min</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-amber-600" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex gap-3 p-2 bg-emerald-50 rounded">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">New application received</p>
                                            <p className="text-slate-500 text-xs">2 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-2 bg-blue-50 rounded">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">Interview scheduled</p>
                                            <p className="text-slate-500 text-xs">5 hours ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 p-2 bg-amber-50 rounded">
                                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">Application shortlisted</p>
                                            <p className="text-slate-500 text-xs">1 day ago</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <Tabs defaultValue="overview" className="space-y-5">
                            <TabsList className="bg-white shadow-sm border w-full">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value="details" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                                    Details
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                
                                <Card className="shadow-sm">
                                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-emerald-600" />
                                            Job Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <MapPin className="h-5 w-5 text-emerald-500" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Location</div>
                                                    <div className="font-medium">{jobData.location}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <DollarSign className="h-5 w-5 text-blue-500" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Salary Range</div>
                                                    <div className="font-medium">{jobData.salary}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Calendar className="h-5 w-5 text-amber-500" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Application Deadline</div>
                                                    <div className="font-medium">{new Date(jobData.closes).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                <Briefcase className="h-5 w-5 text-purple-500" />
                                                <div>
                                                    <div className="text-sm text-muted-foreground">Position Type</div>
                                                    <div className="font-medium capitalize">{jobData.type}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Target className="h-5 w-5 text-blue-600" />
                                            Job Description
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-700 leading-relaxed text-sm">{jobData.description}</p>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="details" className="space-y-6">
                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                            Requirements
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {jobData.requirements.map((req: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                                    <span className="text-slate-700 text-sm">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Briefcase className="h-5 w-5 text-blue-600" />
                                            Key Responsibilities
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {jobData.responsibilities.map((resp: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                    <span className="text-slate-700 text-sm">{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Award className="h-5 w-5 text-amber-600" />
                                            Benefits & Perks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {jobData.benefits.map((benefit: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                                                    <Star className="h-4 w-4 text-amber-500 mt-1" />
                                                    <span className="text-slate-700 text-sm">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-6">
                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Settings className="h-5 w-5 text-purple-600" />
                                            Application Form Configuration
                                        </CardTitle>
                                        <CardDescription>Required fields for applicants</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            {Object.entries({
                                                personalInfo: 'Personal Information',
                                                education: 'Education Background',
                                                experience: 'Work Experience',
                                                coverLetter: 'Cover Letter',
                                                portfolio: 'Portfolio/Work Samples',
                                                references: 'References'
                                            }).map(([key, label]) => (
                                                <div key={key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                                                    {jobData.applicationForm[key as keyof typeof jobData.applicationForm] ? (
                                                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <div className="h-4 w-4 border-2 border-slate-300 rounded"></div>
                                                    )}
                                                    <span className="text-sm font-medium">{label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {jobData.applicationForm.customQuestions.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold mb-3 text-slate-700">Custom Questions</h4>
                                                <div className="space-y-3">
                                                    {jobData.applicationForm.customQuestions.map((q: any, index: number) => (
                                                        <div key={q.id} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-medium text-purple-800">
                                                                    {index + 1}. {q.question}
                                                                </span>
                                                                {q.required && (
                                                                    <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-purple-600 capitalize">
                                                                {q.type} {q.options && `• ${q.options.length} options`}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                
                                <Card>
                                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Eye className="h-5 w-5 text-slate-600" />
                                            Job Status & Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium">Current Status</span>
                                            {getStatusBadge(jobData.status)}
                                        </div>

                                        <Separator />

                                        <div className="space-y-3">
                                            <Button variant="outline" size="sm" className="w-full border-blue-secondary text-blue-primary hover:bg-blue-secondary hover:text-white">
                                                {jobData.status === 'published' ? 'Close Job' : 'Publish Job'}
                                            </Button>
                                            {jobData.status === 'published' && (
                                                <Button variant="outline" size="sm" className="w-full border-orange-primary text-amber-700 hover:bg-yellow-primary">
                                                    Pause Applications
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    )
}