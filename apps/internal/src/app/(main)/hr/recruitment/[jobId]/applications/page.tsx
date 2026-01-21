"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KanbanBoard, KanbanColumn, KanbanItem } from '@/components/ui/kanban-board'
import { ApplicationDetailPanel } from '@/components/hr/application-detail-panel'
import {
    Search,
    Filter,
    Download,
    Users,
    Clock,
    TrendingUp,
    CheckCircle,
    Eye,
    Bot,
    MessageSquare, Building
} from 'lucide-react'

const jobData = {
    id: '1',
    title: 'Senior Agricultural Specialist',
    department: 'Agriculture',
    type: 'employment',
    status: 'published',
    applications: 23,
    location: 'Kigali, Rwanda',
    salary: '$40,000 - $55,000',
    posted: '2024-12-01',
    closes: '2024-12-31'
}

const jobApplications = [
    {
        id: '1',
        applicantName: 'Jean Baptiste Uwimana',
        email: 'jean.uwimana@email.com',
        phone: '+250 788 123 456',
        location: 'Kigali, Rwanda',
        jobTitle: 'Senior Agricultural Specialist',
        appliedDate: '2024-12-08',
        status: 'interview',
        stage: 'interview',
        experience: '5 years',
        education: "Master's in Agriculture",
        avatar: '',
        coverLetter: "I am writing to express my strong interest in the Senior Agricultural Specialist position at GanzAfrica. With over 5 years of experience in agricultural development and a Master's degree in Agricultural Economics, I am confident in my ability to contribute meaningfully to your organization's mission of promoting sustainable farming practices in Rwanda.\n\nMy experience working with smallholder farmers has given me deep insights into the challenges facing agricultural communities in East Africa. I have successfully led several projects focused on sustainable farming techniques, resulting in improved crop yields and enhanced food security for rural communities.\n\nI am particularly drawn to GanzAfrica's commitment to innovation and sustainability. Your recent initiatives in climate-smart agriculture align perfectly with my professional interests and expertise. I am eager to bring my skills in project management, community engagement, and technical knowledge to help advance your agricultural development programs.\n\nThank you for considering my application. I look forward to the opportunity to discuss how my experience and passion for sustainable agriculture can contribute to GanzAfrica's continued success.",
        resume: 'resume_jean_uwimana.pdf',
        portfolio: 'https://portfolio.jean-uwimana.com',
        skills: ['Sustainable Agriculture', 'Project Management', 'Rural Development', 'Community Engagement', 'Data Analysis'],
        workExperience: [
            {
                title: 'Agricultural Extension Officer',
                company: 'Ministry of Agriculture and Animal Resources',
                duration: '2020 - Present',
                description: 'Led training programs for over 500 smallholder farmers across 3 districts, introducing sustainable farming practices that increased average crop yields by 35%. Coordinated with local cooperatives to establish seed distribution networks and provided technical support for integrated pest management programs.'
            },
            {
                title: 'Project Coordinator',
                company: 'Rural Development Initiative',
                duration: '2018 - 2020',
                description: 'Managed agricultural development projects worth $2.5M, focusing on climate-smart agriculture and food security. Collaborated with international donors and government agencies to implement sustainable farming solutions. Successfully established 15 demonstration plots showcasing climate-resilient crops.'
            }
        ],
        educationHistory: [
            {
                degree: 'Master of Science in Agricultural Economics',
                institution: 'University of Rwanda',
                year: '2018',
                grade: 'Distinction (GPA: 3.8/4.0)'
            },
            {
                degree: 'Bachelor of Science in Agriculture',
                institution: 'University of Rwanda',
                year: '2016',
                grade: 'First Class Honours'
            }
        ],
        references: [
            {
                name: 'Dr. Marie Mukamana',
                position: 'Senior Agricultural Advisor',
                company: 'Ministry of Agriculture and Animal Resources',
                email: 'marie.mukamana@minagri.gov.rw',
                phone: '+250 788 987 654'
            },
            {
                name: 'Prof. James Rutabayiru',
                position: 'Head of Agricultural Economics',
                company: 'University of Rwanda',
                email: 'j.rutabayiru@ur.ac.rw',
                phone: '+250 788 123 987'
            }
        ],
        notes: [
            {
                id: '1',
                author: 'Sarah Johnson',
                content: 'Strong candidate with relevant experience. CV shows good progression and practical field experience.',
                timestamp: '2024-12-08 10:30',
                stage: 'CV Screening'
            },
            {
                id: '2',
                author: 'Michael Brown',
                content: 'Excellent performance in technical interview. Demonstrated deep knowledge of sustainable farming practices.',
                timestamp: '2024-12-09 14:15',
                stage: 'Technical Interview'
            }
        ],
        rating: 4,
        cvAnalysis: {
            score: 85,
            matchedKeywords: ['sustainable agriculture', 'project management', 'rural development', 'extension services'],
            missingKeywords: ['climate change adaptation', 'digital agriculture'],
            recommendation: 'advance'
        }
    },
    {
        id: '2',
        applicantName: 'David Nshimiyimana',
        email: 'david.nshimiyimana@email.com',
        phone: '+250 788 345 678',
        location: 'Kigali, Rwanda',
        jobTitle: 'Senior Agricultural Specialist',
        appliedDate: '2024-12-06',
        status: 'final',
        stage: 'final',
        experience: '7 years',
        education: 'PhD in Agricultural Economics',
        avatar: '',
        coverLetter: "With a PhD in Agricultural Economics and 7 years of leadership experience in international development...",
        resume: 'resume_david_nshimiyimana.pdf',
        skills: ['Agricultural Economics', 'Policy Development', 'Research', 'Team Leadership'],
        workExperience: [
            {
                title: 'Senior Agricultural Economist',
                company: 'IFAD Rwanda',
                duration: '2020 - Present',
                description: 'Led economic analysis and policy development for rural development projects.'
            }
        ],
        educationHistory: [
            {
                degree: 'PhD in Agricultural Economics',
                institution: 'Wageningen University',
                year: '2017',
                grade: 'Cum Laude'
            }
        ],
        references: [
            {
                name: 'Dr. Peter Smith',
                position: 'Senior Agricultural Advisor',
                company: 'IFAD',
                email: 'p.smith@ifad.org',
                phone: '+39 06 5459 2345'
            }
        ],
        notes: [
            {
                id: '4',
                author: 'Michael Brown',
                content: 'Exceptional candidate. Strong interview performance and excellent references.',
                timestamp: '2024-12-06 11:15',
                stage: 'Final Review'
            }
        ],
        rating: 5,
        cvAnalysis: {
            score: 95,
            matchedKeywords: ['agricultural economics', 'policy development', 'research', 'rural development'],
            missingKeywords: [],
            recommendation: 'advance'
        }
    },
    {
        id: '3',
        applicantName: 'Grace Mukamana',
        email: 'grace.mukamana@email.com',
        phone: '+250 788 234 567',
        location: 'Huye, Rwanda',
        jobTitle: 'Senior Agricultural Specialist',
        appliedDate: '2024-12-07',
        status: 'screening',
        stage: 'screening',
        experience: '3 years',
        education: "Bachelor's in Agriculture",
        avatar: '',
        coverLetter: "I am excited to apply for the Senior Agricultural Specialist position...",
        resume: 'resume_grace_mukamana.pdf',
        skills: ['Crop Management', 'Data Analysis', 'Community Engagement'],
        workExperience: [],
        educationHistory: [],
        references: [],
        notes: [],
        rating: 3,
        cvAnalysis: {
            score: 65,
            matchedKeywords: ['agriculture', 'community engagement'],
            missingKeywords: ['project management', 'sustainable farming', 'extension services'],
            recommendation: 'review'
        }
    },
    {
        id: '4',
        applicantName: 'Emmanuel Ntirenganya',
        email: 'emmanuel.ntirenganya@email.com',
        phone: '+250 788 456 789',
        location: 'Kigali, Rwanda',
        jobTitle: 'Senior Agricultural Specialist',
        appliedDate: '2024-12-09',
        status: 'applied',
        stage: 'applied',
        experience: '4 years',
        education: "Master's in Agricultural Science",
        avatar: '',
        coverLetter: "I am writing to express my interest in joining GanzAfrica...",
        resume: 'resume_emmanuel_ntirenganya.pdf',
        skills: ['Sustainable Farming', 'Training', 'Project Coordination'],
        workExperience: [],
        educationHistory: [],
        references: [],
        notes: [],
        rating: 0,
        cvAnalysis: {
            score: 78,
            matchedKeywords: ['sustainable farming', 'project coordination', 'training'],
            missingKeywords: ['rural development', 'extension services'],
            recommendation: 'advance'
        }
    },
    {
        id: '5',
        applicantName: 'Alice Uwizeye',
        email: 'alice.uwizeye@email.com',
        phone: '+250 788 567 890',
        location: 'Musanze, Rwanda',
        jobTitle: 'Senior Agricultural Specialist',
        appliedDate: '2024-12-05',
        status: 'offer',
        stage: 'offer',
        experience: '6 years',
        education: "Master's in Agricultural Engineering",
        avatar: '',
        coverLetter: "As an experienced agricultural engineer with a passion for sustainable development...",
        resume: 'resume_alice_uwizeye.pdf',
        skills: ['Agricultural Engineering', 'Irrigation Systems', 'Technology Transfer'],
        workExperience: [],
        educationHistory: [],
        references: [],
        notes: [],
        rating: 5,
        cvAnalysis: {
            score: 88,
            matchedKeywords: ['agricultural engineering', 'technology transfer', 'sustainable development'],
            missingKeywords: ['community engagement'],
            recommendation: 'advance'
        }
    }
]

const applicationStages: KanbanColumn[] = [
    {
        id: 'applied',
        title: 'Applied',
        color: '#3b82f6',
        items: []
    },
    {
        id: 'screening',
        title: 'CV Screening',
        color: '#f59e0b',
        items: []
    },
    {
        id: 'interview',
        title: 'Interview',
        color: '#8b5cf6',
        items: []
    },
    {
        id: 'assessment',
        title: 'Assessment',
        color: '#f97316',
        items: []
    },
    {
        id: 'final',
        title: 'Final Review',
        color: '#6366f1',
        items: []
    },
    {
        id: 'offer',
        title: 'Offer Extended',
        color: '#10b981',
        items: []
    },
    {
        id: 'hired',
        title: 'Hired',
        color: '#059669',
        items: []
    },
    {
        id: 'rejected',
        title: 'Rejected',
        color: '#ef4444',
        items: []
    }
]

const emailTemplates = [
    {
        id: 'advance_screening',
        name: 'Advance to Next Stage',
        subject: 'Application Update - {{jobTitle}}',
        content: `Dear {{applicantName}},

Thank you for your application for the {{jobTitle}} position at GanzAfrica. We are pleased to inform you that your application has been reviewed and you have been selected to proceed to the next stage of our recruitment process.

{{#notes}}
Feedback from our review: {{notes}}
{{/notes}}

Next Steps:
- You will be contacted within 2-3 business days with further instructions
- Please ensure your contact information is up to date

Best regards,
HR Team
GanzAfrica`
    },
    {
        id: 'rejection_screening',
        name: 'Rejection After Screening',
        subject: 'Application Status - {{jobTitle}}',
        content: `Dear {{applicantName}},

Thank you for your interest in the {{jobTitle}} position at GanzAfrica and for taking the time to submit your application.

After careful review of your application, we have decided not to move forward with your candidacy at this time. This decision was made based on our current requirements and the competitive nature of this position.

{{#notes}}
Additional feedback: {{notes}}
{{/notes}}

We encourage you to apply for future opportunities that match your skills and experience. Your resume will be kept on file for consideration for other suitable positions.

Thank you again for your interest in GanzAfrica.

Best regards,
HR Team
GanzAfrica`
    }
]

export default function JobApplicationsPage({ params }: { params: { jobId: string } }) {
    const [searchTerm, setSearchTerm] = useState("")
    const [stageFilter, setStageFilter] = useState("all")
    const [selectedApplication, setSelectedApplication] = useState<any>(null)
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const [applicationsData, setApplicationsData] = useState(jobApplications)
    const [showAutomationSettings, setShowAutomationSettings] = useState(false)

    const convertToKanbanItems = (apps: typeof jobApplications): KanbanColumn[] => {
        const columns = [...applicationStages]

        columns.forEach(column => {
            column.items = apps
                .filter(app => app.stage === column.id)
                .filter(app => {
                    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        app.email.toLowerCase().includes(searchTerm.toLowerCase())
                    return matchesSearch
                })
                .map(app => ({
                    id: app.id,
                    title: app.applicantName,
                    subtitle: app.email,
                    description: `${app.experience} experience • ${app.education}`,
                    status: app.stage,
                    priority: app.rating >= 4 ? 'high' : app.rating >= 3 ? 'medium' : app.rating > 0 ? 'low' : undefined,
                    metadata: {
                        email: app.email,
                        phone: app.phone,
                        location: app.location,
                        experience: app.experience,
                        education: app.education,
                        cvScore: app.cvAnalysis?.score
                    },
                    tags: app.skills.slice(0, 3),
                    date: new Date(app.appliedDate).toLocaleDateString()
                }))
        })

        return columns
    }

    const [kanbanData, setKanbanData] = useState<KanbanColumn[]>(convertToKanbanItems(applicationsData))

    React.useEffect(() => {
        setKanbanData(convertToKanbanItems(applicationsData))
    }, [searchTerm, applicationsData])

    const handleItemClick = (item: KanbanItem) => {
        const application = applicationsData.find(app => app.id === item.id)
        if (application) {
            setSelectedApplication(application)
            setIsPanelOpen(true)
        }
    }

    const handleItemMove = (itemId: string, fromColumn: string, toColumn: string) => {

        const updatedApplications = applicationsData.map(app => {
            if (app.id === itemId) {
                return { ...app, stage: toColumn, status: toColumn }
            }
            return app
        })

        setApplicationsData(updatedApplications)
        console.log(`Moved application ${itemId} from ${fromColumn} to ${toColumn}`)
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

    const handleStageChange = (applicationId: string, newStage: string, note: string) => {
        const updatedApplications = applicationsData.map(app => {
            if (app.id === applicationId) {
                const newNote = {
                    id: Date.now().toString(),
                    author: 'Current User',
                    content: note || `Moved to ${newStage}`,
                    timestamp: new Date().toLocaleString(),
                    stage: newStage
                }
                return {
                    ...app,
                    stage: newStage,
                    status: newStage,
                    notes: [...app.notes, newNote]
                }
            }
            return app
        })

        setApplicationsData(updatedApplications)

        if (selectedApplication?.id === applicationId) {
            const updatedApp = updatedApplications.find(app => app.id === applicationId)
            setSelectedApplication(updatedApp)
        }
    }

    const handleScheduleInterview = (applicationId: string, details: any) => {
        console.log('Schedule interview for:', applicationId, details)
    }

    const handleItemAction = (action: string, item: KanbanItem) => {
        switch (action) {
            case 'view':
                handleItemClick(item)
                break
            case 'edit':
                console.log('Edit application:', item.id)
                break
            case 'schedule':
                console.log('Schedule interview for:', item.id)
                break
            case 'email':
                console.log('Send email to:', item.id)
                break
            default:
                break
        }
    }

    const totalApplications = applicationsData.length
    const newThisWeek = applicationsData.filter(app => {
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        return new Date(app.appliedDate) >= oneWeekAgo
    }).length

    const interviewsScheduled = applicationsData.filter(app => app.stage === 'interview').length
    const offersExtended = applicationsData.filter(app => app.stage === 'offer').length



    return (
        <div className="min-h-screen">
            <div className="transition-all duration-300 ">
                <div className="p-6 space-y-8">

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <div className="flex items-center gap-3 ">
                                <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                                    {jobData.title}

                                </h1>
                                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getDepartmentColor(jobData.department)}`}>
                                        <Building className="h-3 w-3" />
                                        {jobData.department}
                                    </div>

                                </div>
                                <p className="text-muted-foreground text-sm">
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 capitalize">
                                        {jobData.status}
                                    </Badge>  • {totalApplications} applications
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button variant="outline" onClick={() => setShowAutomationSettings(true)} className="border-purple-700 text-purple-700 hover:bg-purple-700 hover:text-white">
                                <Bot className="h-4 w-4 mr-2" />
                                Automation
                            </Button>
                            <Button variant="outline" size="sm" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>


                    <div className="grid gap-6 md:grid-cols-4">
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-emerald-100">Total Applications</CardTitle>
                                <Users className="h-5 w-5 text-emerald-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{totalApplications}</div>
                                <p className="text-xs text-emerald-100 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    <span className="text-emerald-200">+{newThisWeek}</span> this week
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-100">Interviews Scheduled</CardTitle>
                                <Clock className="h-5 w-5 text-blue-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{interviewsScheduled}</div>
                                <p className="text-xs text-blue-100">Active interviews</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-amber-100">Offers Extended</CardTitle>
                                <CheckCircle className="h-5 w-5 text-amber-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{offersExtended}</div>
                                <p className="text-xs text-amber-100">Pending responses</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-purple-100">Conversion Rate</CardTitle>
                                <TrendingUp className="h-5 w-5 text-purple-200" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {totalApplications > 0 ? Math.round((offersExtended / totalApplications) * 100) : 0}%
                                </div>
                                <p className="text-xs text-purple-100">Application to offer</p>
                            </CardContent>
                        </Card>
                    </div>


                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search applicants..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                        />
                                    </div>
                                    <Select value={stageFilter} onValueChange={setStageFilter}>
                                        <SelectTrigger className="w-[180px] border-slate-200">
                                            <SelectValue placeholder="Filter by stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stages</SelectItem>
                                            {applicationStages.map((stage) => (
                                                <SelectItem key={stage.id} value={stage.id}>
                                                    {stage.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        More Filters
                                    </Button>
                                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Job Details
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

<div className="flex flex-row space-x-2">
                    <Card className={`${isPanelOpen ? 'md:w-2/3' : 'w-full'}`}>
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Users className="h-6 w-6 text-emerald-600" />
                                Application Pipeline
                            </CardTitle>
                            <CardDescription>
                                Drag and drop candidates between stages to update their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <KanbanBoard
                                columns={kanbanData}
                                onItemMove={handleItemMove}
                                onItemClick={handleItemClick}
                                onItemAction={handleItemAction}
                                className="min-h-[600px]"
                            />
                        </CardContent>
                    </Card>
    <div className={`flex-1 ${isPanelOpen ? 'md:w-1/3' : 'hidden'}`}>
                    {selectedApplication && (
                        <ApplicationDetailPanel
                            application={selectedApplication}
                            isOpen={isPanelOpen}
                            onClose={() => {
                                setIsPanelOpen(false)
                                setSelectedApplication(null)
                            }}
                            onStageChange={handleStageChange}
                            onScheduleInterview={handleScheduleInterview}
                            emailTemplates={emailTemplates}
                        />
                    )}
    </div>
</div>
                </div>
            </div>





            {showAutomationSettings && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-purple-600" />
                                CV Screening Automation
                            </CardTitle>
                            <CardDescription>
                                Configure automatic CV screening based on keywords and criteria
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Required Keywords</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {['sustainable agriculture', 'project management', 'rural development', 'extension services'].map((keyword) => (
                                            <Badge key={keyword} className="bg-emerald-100 text-emerald-700">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Minimum Experience</h4>
                                    <Select defaultValue="3">
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">1 year</SelectItem>
                                            <SelectItem value="2">2 years</SelectItem>
                                            <SelectItem value="3">3 years</SelectItem>
                                            <SelectItem value="5">5 years</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Auto-reject if CV score below</h4>
                                    <Select defaultValue="60">
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="50">50%</SelectItem>
                                            <SelectItem value="60">60%</SelectItem>
                                            <SelectItem value="70">70%</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <h4 className="font-semibold mb-2">Email Templates</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-3 border rounded">
                                            <span className="text-sm">Advance to Next Stage</span>
                                            <Button variant="outline" size="sm">
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                        <div className="flex items-center justify-between p-3 border rounded">
                                            <span className="text-sm">Rejection After Screening</span>
                                            <Button variant="outline" size="sm">
                                                <MessageSquare className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    onClick={() => setShowAutomationSettings(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => setShowAutomationSettings(false)}
                                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                >
                                    Save Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}