"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    FileText,
    Download,
    Eye,
    MessageSquare,
    XCircle,
    ArrowRight,
    Star,
    Briefcase,
    GraduationCap,
    Award,
    ExternalLink,
    X,
    CheckCircle,
    Send,
    Bot,
    AlertTriangle
} from 'lucide-react'

interface Application {
    id: string
    applicantName: string
    email: string
    phone: string
    location: string
    jobTitle: string
    appliedDate: string
    status: string
    stage: string
    experience: string
    education: string
    avatar?: string
    coverLetter: string
    resume: string
    portfolio?: string
    references: Array<{
        name: string
        position: string
        company: string
        email: string
        phone: string
    }>
    workExperience: Array<{
        title: string
        company: string
        duration: string
        description: string
    }>
    educationHistory: Array<{
        degree: string
        institution: string
        year: string
        grade?: string
    }>
    skills: string[]
    notes: Array<{
        id: string
        author: string
        content: string
        timestamp: string
        stage: string
    }>
    rating?: number
    cvAnalysis?: {
        score: number
        matchedKeywords: string[]
        missingKeywords: string[]
        recommendation: string
    }
}

interface EmailTemplate {
    id: string
    name: string
    subject: string
    content: string
}

interface ApplicationDetailPanelProps {
    application: Application
    isOpen: boolean
    onClose: () => void
    onStageChange: (applicationId: string, newStage: string, note: string) => void
    onScheduleInterview: (applicationId: string, details: any) => void
    emailTemplates: EmailTemplate[]
}

const stages = [
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'screening', label: 'CV Screening', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-800' },
    { value: 'assessment', label: 'Assessment', color: 'bg-orange-100 text-orange-800' },
    { value: 'final', label: 'Final Review', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'offer', label: 'Offer Extended', color: 'bg-green-100 text-green-800' },
    { value: 'hired', label: 'Hired', color: 'bg-green-600 text-white' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' }
]

export function ApplicationDetailPanel({
                                           application,
                                           isOpen,
                                           onClose,
                                           onStageChange,
                                           onScheduleInterview,
                                           emailTemplates
                                       }: ApplicationDetailPanelProps) {
    const [selectedStage, setSelectedStage] = useState(application.stage)
    const [stageNote, setStageNote] = useState('')
    const [rating, setRating] = useState(application.rating || 0)
    const [interviewDetails, setInterviewDetails] = useState({
        date: '',
        time: '',
        type: 'video',
        link: '',
        notes: ''
    })
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [emailContent, setEmailContent] = useState('')
    const [showEmailDialog, setShowEmailDialog] = useState(false)

    const currentStage = stages.find(s => s.value === application.stage)

    const handleStageChange = () => {
        if (selectedStage !== application.stage) {
            onStageChange(application.id, selectedStage, stageNote)
            setStageNote('')
        }
    }

    const handleScheduleInterview = () => {
        onScheduleInterview(application.id, interviewDetails)
        setInterviewDetails({
            date: '',
            time: '',
            type: 'video',
            link: '',
            notes: ''
        })
    }

    const getStatusBadge = (status: string) => {
        const stage = stages.find(s => s.value === status)
        return stage ? (
            <Badge className={stage.color}>{stage.label}</Badge>
        ) : (
            <Badge variant="outline">{status}</Badge>
        )
    }

    const getCVScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600'
        if (score >= 60) return 'text-amber-600'
        return 'text-red-600'
    }

    const handleTemplateSelect = (templateId: string) => {
        const template = emailTemplates.find(t => t.id === templateId)
        if (template) {
            setSelectedTemplate(templateId)

            let content = template.content
                .replace(/{{applicantName}}/g, application.applicantName)
                .replace(/{{jobTitle}}/g, application.jobTitle)

            if (stageNote) {
                content = content.replace(/{{#notes}}[\s\S]*?{{\/notes}}/g, `Feedback from our review: ${stageNote}`)
            } else {
                content = content.replace(/{{#notes}}[\s\S]*?{{\/notes}}/g, '')
            }

            setEmailContent(content)
        }
    }

    return (
        <>


            <div className={`max-h-[860px] w-full bg-white shadow-sm border rounded-md transform transition-transform duration-300 ease-in-out border-l ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="max-h-[850px] overflow-y-auto">

                    <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-blue-50 border-b p-6 z-10">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12">
                                    {application.avatar ? (
                                        <AvatarImage src={application.avatar} />
                                    ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-blue-500 text-white font-semibold">
                                            {application.applicantName.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-800">{application.applicantName}</h3>
                                    <p className="text-sm text-slate-600">Applied for {application.jobTitle}</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/80">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            {getStatusBadge(application.stage)}
                            {application.rating && (
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">{application.rating}/5</span>
                                </div>
                            )}
                            {application.cvAnalysis && (
                                <Badge className="bg-white/80 text-slate-700 border">
                                    <Bot className="h-3 w-3 mr-1" />
                                    CV Score: <span className={getCVScoreColor(application.cvAnalysis.score)}>{application.cvAnalysis.score}%</span>
                                </Badge>
                            )}
                        </div>
                    </div>


                    <div className="p-6">
                        <Tabs defaultValue="overview" className="space-y-4">
                            <TabsList className="grid w-full grid-cols-4 bg-slate-100">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-green-primary data-[state=active]:text-white text-xs">Overview</TabsTrigger>
                                <TabsTrigger value="documents" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white text-xs">Documents</TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white text-xs">History</TabsTrigger>
                                <TabsTrigger value="actions" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white text-xs">Actions</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">

                                {application.cvAnalysis && (
                                    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Bot className="h-4 w-4 text-purple-600" />
                                                AI CV Analysis
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Match Score</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${
                                                                application.cvAnalysis.score >= 80 ? 'bg-emerald-500' :
                                                                    application.cvAnalysis.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                            }`}
                                                            style={{ width: `${application.cvAnalysis.score}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-sm font-bold ${getCVScoreColor(application.cvAnalysis.score)}`}>
                                                        {application.cvAnalysis.score}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-slate-700 mb-1">Matched Keywords</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {application.cvAnalysis.matchedKeywords.map((keyword, index) => (
                                                        <Badge key={index} className="bg-emerald-100 text-emerald-700 text-xs">
                                                            {keyword}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>

                                            {application.cvAnalysis.missingKeywords.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-slate-700 mb-1">Missing Keywords</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {application.cvAnalysis.missingKeywords.map((keyword, index) => (
                                                            <Badge key={index} className="bg-red-100 text-red-700 text-xs">
                                                                {keyword}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 pt-2">
                                                {application.cvAnalysis.recommendation === 'advance' ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Recommended to Advance
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-amber-100 text-amber-700">
                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                        Requires Review
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <User className="h-4 w-4 text-emerald-600" />
                                            Contact Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-blue-500" />
                                            <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                                                {application.email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-emerald-500" />
                                            <a href={`tel:${application.phone}`} className="text-emerald-600 hover:underline">
                                                {application.phone}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-amber-500" />
                                            <span className="text-slate-700">{application.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-purple-500" />
                                            <span className="text-slate-700">Applied on {new Date(application.appliedDate).toLocaleDateString()}</span>
                                        </div>
                                    </CardContent>
                                </Card>


                                {application.workExperience.length > 0 && (
                                    <Card className="border-0 shadow-md">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Briefcase className="h-4 w-4 text-blue-600" />
                                                Work Experience
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {application.workExperience.map((exp, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-sm text-slate-800">{exp.title}</h4>
                                                            <p className="text-sm text-slate-600">{exp.company}</p>
                                                        </div>
                                                        <Badge variant="outline" className="text-xs border-slate-300">{exp.duration}</Badge>
                                                    </div>
                                                    <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                                                    {index < application.workExperience.length - 1 && <Separator className="my-3" />}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}


                                {application.educationHistory.length > 0 && (
                                    <Card className="border-0 shadow-md">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-amber-600" />
                                                Education
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {application.educationHistory.map((edu, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="font-medium text-sm text-slate-800">{edu.degree}</h4>
                                                        <p className="text-sm text-slate-600">{edu.institution}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium text-slate-800">{edu.year}</p>
                                                        {edu.grade && (
                                                            <p className="text-xs text-slate-500">{edu.grade}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Award className="h-4 w-4 text-purple-600" />
                                            Skills
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {application.skills.map((skill, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-indigo-600" />
                                            Cover Letter
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="max-h-48 overflow-y-auto">
                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                                {application.coverLetter}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="documents" className="space-y-4">
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Uploaded Documents</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-100 rounded">
                                                    <FileText className="h-4 w-4 text-red-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">Resume.pdf</p>
                                                    <p className="text-xs text-slate-500">Uploaded {application.appliedDate}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>

                                        {application.portfolio && (
                                            <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded">
                                                        <ExternalLink className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">Portfolio</p>
                                                        <p className="text-xs text-slate-500">External link</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                                                    <a href={application.portfolio} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>


                                {application.references.length > 0 && (
                                    <Card className="border-0 shadow-md">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm">References</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {application.references.map((ref, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-sm text-slate-800">{ref.name}</h4>
                                                            <p className="text-sm text-slate-600">{ref.position}</p>
                                                            <p className="text-sm text-slate-600">{ref.company}</p>
                                                        </div>
                                                        <div className="text-right text-xs text-slate-500">
                                                            <p>{ref.email}</p>
                                                            <p>{ref.phone}</p>
                                                        </div>
                                                    </div>
                                                    {index < application.references.length - 1 && <Separator />}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="history" className="space-y-4">
                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Application Timeline</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {application.notes.map((note, index) => (
                                                <div key={note.id} className="flex gap-3">
                                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-medium text-slate-800">{note.stage}</span>
                                                            <span className="text-xs text-slate-500">{note.timestamp}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600">{note.content}</p>
                                                        <p className="text-xs text-slate-500 mt-1">by {note.author}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="actions" className="space-y-4">

                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Rate Candidate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Button
                                                    key={star}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-1 hover:bg-yellow-50"
                                                    onClick={() => setRating(star)}
                                                >
                                                    <Star
                                                        className={`h-5 w-5 transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                </Button>
                                            ))}
                                            <span className="text-sm text-slate-600 ml-2">{rating}/5</span>
                                        </div>
                                    </CardContent>
                                </Card>


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Update Application Stage</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>New Stage</Label>
                                            <Select value={selectedStage} onValueChange={setSelectedStage}>
                                                <SelectTrigger className="border-slate-200">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stages.map((stage) => (
                                                        <SelectItem key={stage.value} value={stage.value}>
                                                            {stage.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Add Note</Label>
                                            <Textarea
                                                value={stageNote}
                                                onChange={(e) => setStageNote(e.target.value)}
                                                placeholder="Add a note about this stage change..."
                                                rows={3}
                                                className="border-slate-200"
                                            />
                                        </div>

                                        <Button
                                            onClick={handleStageChange}
                                            disabled={selectedStage === application.stage}
                                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                                        >
                                            <ArrowRight className="h-4 w-4 mr-2" />
                                            Update Stage
                                        </Button>
                                    </CardContent>
                                </Card>


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Schedule Interview</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-3">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={interviewDetails.date}
                                                        onChange={(e) => setInterviewDetails(prev => ({ ...prev, date: e.target.value }))}
                                                        className="border-slate-200 text-sm"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Time</Label>
                                                    <Input
                                                        type="time"
                                                        value={interviewDetails.time}
                                                        onChange={(e) => setInterviewDetails(prev => ({ ...prev, time: e.target.value }))}
                                                        className="border-slate-200 text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs">Interview Type</Label>
                                                <Select
                                                    value={interviewDetails.type}
                                                    onValueChange={(value) => setInterviewDetails(prev => ({ ...prev, type: value }))}
                                                >
                                                    <SelectTrigger className="border-slate-200">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="video">Video Call</SelectItem>
                                                        <SelectItem value="phone">Phone Call</SelectItem>
                                                        <SelectItem value="inperson">In Person</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {interviewDetails.type === 'video' && (
                                                <div className="space-y-1">
                                                    <Label className="text-xs">Meeting Link</Label>
                                                    <Input
                                                        value={interviewDetails.link}
                                                        onChange={(e) => setInterviewDetails(prev => ({ ...prev, link: e.target.value }))}
                                                        placeholder="https://zoom.us/j/..."
                                                        className="border-slate-200 text-sm"
                                                    />
                                                </div>
                                            )}

                                            <div className="space-y-1">
                                                <Label className="text-xs">Notes</Label>
                                                <Textarea
                                                    value={interviewDetails.notes}
                                                    onChange={(e) => setInterviewDetails(prev => ({ ...prev, notes: e.target.value }))}
                                                    placeholder="Any additional notes for the interview..."
                                                    rows={2}
                                                    className="border-slate-200 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <Button onClick={handleScheduleInterview} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Schedule Interview
                                        </Button>
                                    </CardContent>
                                </Card>


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Email Communication</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50">
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Template Email
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                                <DialogHeader>
                                                    <DialogTitle>Send Email</DialogTitle>
                                                    <DialogDescription>
                                                        Choose a template and customize the message
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Email Template</Label>
                                                        <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a template" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {emailTemplates.map((template) => (
                                                                    <SelectItem key={template.id} value={template.id}>
                                                                        {template.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Email Content</Label>
                                                        <Textarea
                                                            value={emailContent}
                                                            onChange={(e) => setEmailContent(e.target.value)}
                                                            placeholder="Email content will appear here when you select a template..."
                                                            rows={12}
                                                            className="font-mono text-sm"
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button variant="outline" onClick={() => setShowEmailDialog(false)} className="flex-1">
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                console.log('Sending email:', emailContent)
                                                                setShowEmailDialog(false)
                                                            }}
                                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700"
                                                        >
                                                            <Send className="h-4 w-4 mr-2" />
                                                            Send Email
                                                        </Button>
                                                    </div>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                                            <Mail className="h-4 w-4 mr-2" />
                                            Compose Custom Email
                                        </Button>

                                        <Button variant="outline" className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50">
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Add Internal Note
                                        </Button>
                                    </CardContent>
                                </Card>


                                <Card className="border-0 shadow-md">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm">Quick Actions</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                            onClick={() => {
                                                setSelectedStage('interview')
                                                setStageNote('Candidate shows strong potential based on initial review.')
                                            }}
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Quick Advance
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
                                            onClick={() => {
                                                setSelectedStage('rejected')
                                                setStageNote('Does not meet minimum requirements for this position.')
                                            }}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Quick Reject
                                        </Button>

                                        <Button
                                            variant="outline"
                                            className="w-full justify-start border-amber-200 text-amber-700 hover:bg-amber-50"
                                            onClick={() => {
                                                setInterviewDetails({
                                                    ...interviewDetails,
                                                    type: 'video',
                                                    notes: 'Standard technical interview for senior position'
                                                })
                                            }}
                                        >
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Quick Schedule
                                        </Button>
                                    </CardContent>
                                </Card>


                                {application.cvAnalysis && (
                                    <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-indigo-50">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Bot className="h-4 w-4 text-purple-600" />
                                                AI Recommendations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {application.cvAnalysis.recommendation === 'advance' ? (
                                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                                                        <span className="text-sm font-medium text-emerald-800">
                                                            AI Recommends: Advance to Next Stage
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-emerald-700">
                                                        CV score of {application.cvAnalysis.score}% meets advancement criteria.
                                                        Strong keyword matches found.
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        onClick={() => {
                                                            setSelectedStage('interview')
                                                            setStageNote(`AI Analysis: CV score ${application.cvAnalysis.score}% with strong keyword matches. Recommended for advancement.`)
                                                        }}
                                                    >
                                                        Apply AI Recommendation
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                                        <span className="text-sm font-medium text-amber-800">
                                                            AI Recommends: Manual Review Required
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-amber-700">
                                                        CV score of {application.cvAnalysis.score}% below auto-advance threshold.
                                                        Missing key requirements.
                                                    </p>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                                                        onClick={() => {
                                                            setStageNote(`AI Analysis: CV score ${application.cvAnalysis.score}%. Missing keywords: ${application.cvAnalysis.missingKeywords.join(', ')}. Requires manual review.`)
                                                        }}
                                                    >
                                                        Add AI Analysis Note
                                                    </Button>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    )
}