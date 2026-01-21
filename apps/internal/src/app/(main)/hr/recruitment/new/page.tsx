"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Plus,
    X,
    Save,
    Eye,
    Send,
    FileText,
    Settings,
    MapPin,
    DollarSign,
    Calendar,
    Briefcase,
    CheckCircle,
    Award
} from 'lucide-react'

interface JobFormData {
    title: string
    department: string
    type: 'employment' | 'fellowship' | 'internship'
    location: string
    workType: 'onsite' | 'remote' | 'hybrid'
    salaryMin: string
    salaryMax: string
    currency: string
    description: string
    requirements: string[]
    responsibilities: string[]
    benefits: string[]
    applicationDeadline: string
    startDate: string
    duration: string
    experienceLevel: string
    educationLevel: string
    status: 'draft' | 'published'
    applicationForm: {
        personalInfo: boolean
        education: boolean
        experience: boolean
        coverLetter: boolean
        portfolio: boolean
        references: boolean
        customQuestions: Array<{
            id: string
            question: string
            type: 'text' | 'textarea' | 'select' | 'checkbox' | 'file'
            required: boolean
            options?: string[]
        }>
    }
}

const initialFormData: JobFormData = {
    title: '',
    department: '',
    type: 'employment',
    location: '',
    workType: 'onsite',
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    description: '',
    requirements: [],
    responsibilities: [],
    benefits: [],
    applicationDeadline: '',
    startDate: '',
    duration: '',
    experienceLevel: '',
    educationLevel: '',
    status: 'draft',
    applicationForm: {
        personalInfo: true,
        education: true,
        experience: true,
        coverLetter: true,
        portfolio: false,
        references: false,
        customQuestions: []
    }
}

const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
        case 'agriculture':
            return 'bg-emerald-50 border-emerald-200 text-emerald-800'
        case 'environment':
            return 'bg-blue-50 border-blue-200 text-blue-800'
        case 'land-management':
            return 'bg-amber-50 border-amber-200 text-amber-800'
        case 'fellowship':
            return 'bg-purple-50 border-purple-200 text-purple-800'
        case 'administration':
            return 'bg-orange-50 border-orange-200 text-orange-800'
        case 'hr':
            return 'bg-pink-50 border-pink-200 text-pink-800'
        default:
            return 'bg-slate-50 border-slate-200 text-slate-800'
    }
}

export default function NewJobPostingPage() {
    const router = useRouter()
    const [formData, setFormData] = useState<JobFormData>(initialFormData)
    const [newRequirement, setNewRequirement] = useState('')
    const [newResponsibility, setNewResponsibility] = useState('')
    const [newBenefit, setNewBenefit] = useState('')
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        type: 'text' as const,
        required: false,
        options: ['']
    })

    const handleInputChange = (field: keyof JobFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleApplicationFormChange = (field: keyof JobFormData['applicationForm'], value: any) => {
        setFormData(prev => ({
            ...prev,
            applicationForm: { ...prev.applicationForm, [field]: value }
        }))
    }

    const addToArray = (field: 'requirements' | 'responsibilities' | 'benefits', value: string) => {
        if (value.trim()) {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], value.trim()]
            }))

            if (field === 'requirements') setNewRequirement('')
            if (field === 'responsibilities') setNewResponsibility('')
            if (field === 'benefits') setNewBenefit('')
        }
    }

    const removeFromArray = (field: 'requirements' | 'responsibilities' | 'benefits', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }))
    }

    const addCustomQuestion = () => {
        if (newQuestion.question.trim()) {
            const question = {
                id: Date.now().toString(),
                question: newQuestion.question,
                type: newQuestion.type,
                required: newQuestion.required,
                options: newQuestion.type === 'select' ? newQuestion.options.filter(o => o.trim()) : undefined
            }

            handleApplicationFormChange('customQuestions', [
                ...formData.applicationForm.customQuestions,
                question
            ])

            setNewQuestion({
                question: '',
                type: 'text',
                required: false,
                options: ['']
            })
        }
    }

    const removeCustomQuestion = (id: string) => {
        handleApplicationFormChange('customQuestions',
            formData.applicationForm.customQuestions.filter(q => q.id !== id)
        )
    }

    const handleSave = (status: 'draft' | 'published') => {
        const jobData = { ...formData, status }
        console.log('Saving job posting:', jobData)

        router.push('/hr/recruitment')
    }

    const handlePreview = () => {

        console.log('Preview job posting:', formData)
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                                Create Job Posting
                            </h1>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePreview} className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                        <Button variant="outline" onClick={() => handleSave('draft')} className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-white">
                            <Save className="h-4 w-4" />
                            Save Draft
                        </Button>
                        <Button onClick={() => handleSave('published')}>
                            <Send className="h-4 w-4" />
                            Publish Job
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="basic" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <FileText className="h-4 w-4 mr-2" />
                            Basic Information
                        </TabsTrigger>
                        <TabsTrigger value="details" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Job Details
                        </TabsTrigger>
                        <TabsTrigger value="application" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <Settings className="h-4 w-4 mr-2" />
                            Application Form
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-600" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the basic details for this job posting
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-sm font-medium">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="e.g., Senior Agricultural Specialist"
                                            className="border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-sm font-medium">Department *</Label>
                                        <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                                            <SelectTrigger className="border-slate-200 focus:border-emerald-400">
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="agriculture">Agriculture</SelectItem>
                                                <SelectItem value="environment">Environment</SelectItem>
                                                <SelectItem value="land-management">Land Management</SelectItem>
                                                <SelectItem value="fellowship">Fellowship Program</SelectItem>
                                                <SelectItem value="administration">Administration</SelectItem>
                                                <SelectItem value="hr">Human Resources</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-sm font-medium">Position Type *</Label>
                                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                                            <SelectTrigger className="border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="employment">Full-time Employment</SelectItem>
                                                <SelectItem value="fellowship">Fellowship</SelectItem>
                                                <SelectItem value="internship">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location" className="text-sm font-medium">Location *</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                placeholder="e.g., Kigali, Rwanda"
                                                className="pl-10 border-slate-200 focus:border-emerald-400"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workType" className="text-sm font-medium">Work Type</Label>
                                        <Select value={formData.workType} onValueChange={(value) => handleInputChange('workType', value)}>
                                            <SelectTrigger className="border-slate-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="onsite">On-site</SelectItem>
                                                <SelectItem value="remote">Remote</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="font-medium mb-3 text-blue-800 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Compensation Details
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                                            <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="USD">USD ($)</SelectItem>
                                                    <SelectItem value="RWF">RWF (₣)</SelectItem>
                                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="salaryMin" className="text-sm font-medium">Min Salary</Label>
                                            <Input
                                                id="salaryMin"
                                                type="number"
                                                value={formData.salaryMin}
                                                onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                                                placeholder="30000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="salaryMax" className="text-sm font-medium">Max Salary</Label>
                                            <Input
                                                id="salaryMax"
                                                type="number"
                                                value={formData.salaryMax}
                                                onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                                                placeholder="50000"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="experienceLevel" className="text-sm font-medium">Experience Level</Label>
                                            <Select value={formData.experienceLevel} onValueChange={(value) => handleInputChange('experienceLevel', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                                                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                                                    <SelectItem value="senior">Senior Level (5+ years)</SelectItem>
                                                    <SelectItem value="executive">Executive Level</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <h4 className="font-medium mb-3 text-amber-800 flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Timeline & Duration
                                    </h4>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="applicationDeadline" className="text-sm font-medium">Application Deadline</Label>
                                            <Input
                                                id="applicationDeadline"
                                                type="date"
                                                value={formData.applicationDeadline}
                                                onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="startDate" className="text-sm font-medium">Expected Start Date</Label>
                                            <Input
                                                id="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={(e) => handleInputChange('startDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {formData.type !== 'employment' && (
                                        <div className="space-y-2 mt-4">
                                            <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                                            <Input
                                                id="duration"
                                                value={formData.duration}
                                                onChange={(e) => handleInputChange('duration', e.target.value)}
                                                placeholder="e.g., 12 months, 6 months"
                                            />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-6">
                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Job Description
                                </CardTitle>
                                <CardDescription>
                                    Provide detailed information about the role
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-sm font-medium">Job Description *</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Provide a comprehensive description of the role, its purpose, and context within the organization..."
                                        rows={6}
                                        className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                                    Requirements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newRequirement}
                                        onChange={(e) => setNewRequirement(e.target.value)}
                                        placeholder="Add a requirement..."
                                        className="border-slate-200 focus:border-emerald-400"
                                        onKeyPress={(e) => e.key === 'Enter' && addToArray('requirements', newRequirement)}
                                    />
                                    <Button
                                        onClick={() => addToArray('requirements', newRequirement)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.requirements.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.requirements.map((req, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                <span className="flex-1 text-sm text-emerald-800">{req}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromArray('requirements', index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    Key Responsibilities
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newResponsibility}
                                        onChange={(e) => setNewResponsibility(e.target.value)}
                                        placeholder="Add a responsibility..."
                                        className="border-slate-200 focus:border-blue-400"
                                        onKeyPress={(e) => e.key === 'Enter' && addToArray('responsibilities', newResponsibility)}
                                    />
                                    <Button
                                        onClick={() => addToArray('responsibilities', newResponsibility)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.responsibilities.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.responsibilities.map((resp, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span className="flex-1 text-sm text-blue-800">{resp}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromArray('responsibilities', index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Award className="h-5 w-5 text-amber-600" />
                                    Benefits & Perks
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex gap-2">
                                    <Input
                                        value={newBenefit}
                                        onChange={(e) => setNewBenefit(e.target.value)}
                                        placeholder="Add a benefit..."
                                        className="border-slate-200 focus:border-amber-400"
                                        onKeyPress={(e) => e.key === 'Enter' && addToArray('benefits', newBenefit)}
                                    />
                                    <Button
                                        onClick={() => addToArray('benefits', newBenefit)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {formData.benefits.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.benefits.map((benefit, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                <Award className="h-4 w-4 text-amber-500" />
                                                <span className="flex-1 text-sm text-amber-800">{benefit}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFromArray('benefits', index)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="application" className="space-y-6">
                        
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-purple-600" />
                                    Application Form Configuration
                                </CardTitle>
                                <CardDescription>
                                    Configure what information applicants need to provide
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Standard Fields</Label>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {Object.entries({
                                            education: 'Education Background',
                                            experience: 'Work Experience',
                                            coverLetter: 'Cover Letter',
                                            portfolio: 'Portfolio/Work Samples',
                                            references: 'References',
                                        }).map(([key, label]) => (
                                                <div key={key} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <Checkbox
                                            id={key}
                                            checked={formData.applicationForm[key as keyof typeof formData.applicationForm] as boolean}
                                            onCheckedChange={(checked) => handleApplicationFormChange(key as keyof typeof formData.applicationForm, checked)}
                                            />
                                            <Label htmlFor={key} className="text-sm font-medium flex-1">
                                        {label}
                                    </Label>
                                    {formData.applicationForm[key as keyof typeof formData.applicationForm] && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                </div>
                                ))}
            </div>
        </div>

    <Separator />


    <div className="space-y-4">
        <Label className="text-base font-medium">Custom Questions</Label>
        <p className="text-sm text-muted-foreground">
            Add custom questions specific to this position
        </p>

        
        <Card className="p-4 border-dashed border-2 border-purple-200 bg-purple-50">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="newQuestion" className="text-sm font-medium">Question</Label>
                    <Input
                        id="newQuestion"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                        placeholder="Enter your question..."
                        className="border-purple-200 focus:border-purple-400"
                    />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Question Type</Label>
                        <Select
                            value={newQuestion.type}
                            onValueChange={(value) => setNewQuestion(prev => ({ ...prev, type: value as any }))}
                        >
                            <SelectTrigger className="border-purple-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Short Text</SelectItem>
                                <SelectItem value="textarea">Long Text</SelectItem>
                                <SelectItem value="select">Multiple Choice</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="file">File Upload</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                        <Checkbox
                            id="required"
                            checked={newQuestion.required}
                            onCheckedChange={(checked) => setNewQuestion(prev => ({ ...prev, required: !!checked }))}
                        />
                        <Label htmlFor="required" className="text-sm">
                            Required field
                        </Label>
                    </div>
                </div>

                {newQuestion.type === 'select' && (
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Options</Label>
                        {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <Input
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...newQuestion.options]
                                        newOptions[index] = e.target.value
                                        setNewQuestion(prev => ({ ...prev, options: newOptions }))
                                    }}
                                    placeholder={`Option ${index + 1}`}
                                    className="border-purple-200"
                                />
                                {newQuestion.options.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            const newOptions = newQuestion.options.filter((_, i) => i !== index)
                                            setNewQuestion(prev => ({ ...prev, options: newOptions }))
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNewQuestion(prev => ({ ...prev, options: [...prev.options, ''] }))}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                        </Button>
                    </div>
                )}

                <Button
                    onClick={addCustomQuestion}
                >
                    <Plus className="h-4 w-4" />
                    Add Question
                </Button>
            </div>
        </Card>

        
        {formData.applicationForm.customQuestions.length > 0 && (
            <div className="space-y-3">
                <Label className="text-sm font-medium">Added Questions</Label>
                {formData.applicationForm.customQuestions.map((question, index) => (
                    <Card key={question.id} className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-indigo-800">{question.question}</span>
                                    {question.required && (
                                        <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-indigo-600">
                                    <span className="capitalize bg-indigo-100 px-2 py-1 rounded">{question.type}</span>
                                    {question.options && (
                                        <span className="bg-purple-100 px-2 py-1 rounded">• {question.options.length} options</span>
                                    )}
                                </div>
                                {question.options && (
                                    <div className="mt-2 text-xs text-indigo-600 bg-white bg-opacity-50 p-2 rounded">
                                        Options: {question.options.join(', ')}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCustomQuestion(question.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </div>
</CardContent>
</Card>
</TabsContent>
</Tabs>
</div>
</div>
)
}