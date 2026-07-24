"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    ArrowLeft,
    Upload,
    MapPin,
    DollarSign,
    Calendar,
    Clock,
    Briefcase,
    FileText,
    CheckCircle,
    Building,
    Plus,
    X,
    Users,
    ArrowRight,
    Award,
    User,
    Mail,
    Phone,
    Home,
    GraduationCap,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'

const jobData = {
    id: '1',
    title: 'Senior Agricultural Specialist',
    department: 'Agriculture',
    type: 'employment',
    location: 'Kigali, Rwanda',
    workType: 'onsite',
    salary: '$40,000 - $55,000',
    description: 'Lead agricultural development projects focusing on sustainable farming practices and food security initiatives across Rwanda.',
    requirements: [
        'Master\'s degree in Agriculture, Agricultural Economics, or related field',
        'Minimum 5 years of experience in agricultural development',
        'Strong knowledge of sustainable farming practices',
        'Experience working with rural communities in East Africa',
        'Fluency in English and Kinyarwanda'
    ],
    responsibilities: [
        'Lead agricultural development projects across multiple districts',
        'Develop and implement sustainable farming strategies',
        'Train and mentor local farmers and agricultural extension officers',
        'Collaborate with government agencies and NGO partners',
        'Monitor and evaluate project outcomes and impact'
    ],
    benefits: [
        'Competitive salary and benefits package',
        'Professional development opportunities',
        'Health insurance coverage',
        'Annual leave and public holidays',
        'Transportation allowance'
    ],
    applicationDeadline: '2024-12-31',
    startDate: '2025-01-15',
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
                question: 'What specific experience do you have with sustainable agriculture practices in Rwanda or East Africa?',
                type: 'textarea',
                required: true
            },
            {
                id: '2',
                question: 'Which languages can you speak fluently?',
                type: 'select',
                required: true,
                options: ['English only', 'English and French', 'English and Kinyarwanda', 'English, French, and Kinyarwanda', 'Other combination']
            },
            {
                id: '3',
                question: 'Are you willing to travel to rural areas for extended periods?',
                type: 'select',
                required: true,
                options: ['Yes, regularly', 'Yes, occasionally', 'No, prefer office-based work']
            }
        ]
    }
}

interface FormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    country: string
    dateOfBirth: string
    nationality: string
    education: Array<{
        id: string
        degree: string
        institution: string
        year: string
        grade: string
    }>
    experience: Array<{
        id: string
        title: string
        company: string
        startDate: string
        endDate: string
        current: boolean
        description: string
    }>
    coverLetter: string
    references: Array<{
        id: string
        name: string
        position: string
        company: string
        email: string
        phone: string
        relationship: string
    }>
    resume: File | null
    portfolio: File | null
    customAnswers: Record<string, string>
    dataConsent: boolean
    termsConsent: boolean
}

const initialFormData: FormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    nationality: '',
    education: [],
    experience: [],
    coverLetter: '',
    references: [],
    resume: null,
    portfolio: null,
    customAnswers: {},
    dataConsent: false,
    termsConsent: false
}

const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
        case 'agriculture':
            return 'bg-emerald-50 border-emerald-200 text-emerald-800'
        case 'environment':
            return 'bg-blue-50 border-blue-200 text-blue-800'
        case 'land management':
            return 'bg-amber-50 border-amber-200 text-amber-800'
        case 'fellowship program':
            return 'bg-purple-50 border-purple-200 text-purple-800'
        default:
            return 'bg-slate-50 border-slate-200 text-slate-800'
    }
}

export default function JobApplicationPage() {
    const params = useParams()
    const router = useRouter()
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [currentStep, setCurrentStep] = useState(1)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const totalSteps = 6

    const updateFormData = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const addEducation = () => {
        const newEducation = {
            id: Date.now().toString(),
            degree: '',
            institution: '',
            year: '',
            grade: ''
        }
        updateFormData('education', [...formData.education, newEducation])
    }

    const updateEducation = (id: string, field: string, value: string) => {
        const updated = formData.education.map(edu =>
            edu.id === id ? { ...edu, [field]: value } : edu
        )
        updateFormData('education', updated)
    }

    const removeEducation = (id: string) => {
        updateFormData('education', formData.education.filter(edu => edu.id !== id))
    }

    const addExperience = () => {
        const newExperience = {
            id: Date.now().toString(),
            title: '',
            company: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }
        updateFormData('experience', [...formData.experience, newExperience])
    }

    const updateExperience = (id: string, field: string, value: any) => {
        const updated = formData.experience.map(exp =>
            exp.id === id ? { ...exp, [field]: value } : exp
        )
        updateFormData('experience', updated)
    }

    const removeExperience = (id: string) => {
        updateFormData('experience', formData.experience.filter(exp => exp.id !== id))
    }

    const addReference = () => {
        const newReference = {
            id: Date.now().toString(),
            name: '',
            position: '',
            company: '',
            email: '',
            phone: '',
            relationship: ''
        }
        updateFormData('references', [...formData.references, newReference])
    }

    const updateReference = (id: string, field: string, value: string) => {
        const updated = formData.references.map(ref =>
            ref.id === id ? { ...ref, [field]: value } : ref
        )
        updateFormData('references', updated)
    }

    const removeReference = (id: string) => {
        updateFormData('references', formData.references.filter(ref => ref.id !== id))
    }

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        switch (step) {
            case 1: // CV Upload
                if (!formData.resume) newErrors.resume = 'Resume is required'
                break
            case 2: // Personal Info
                if (!formData.firstName) newErrors.firstName = 'First name is required'
                if (!formData.lastName) newErrors.lastName = 'Last name is required'
                if (!formData.email) newErrors.email = 'Email is required'
                if (!formData.phone) newErrors.phone = 'Phone number is required'
                break
            case 3: // Education
                if (formData.education.length === 0) newErrors.education = 'At least one education entry is required'
                break
            case 4: // Experience
                if (formData.experience.length === 0) newErrors.experience = 'At least one work experience entry is required'
                break
            case 5: // Cover Letter & Questions
                if (!formData.coverLetter) newErrors.coverLetter = 'Cover letter is required'
                break
            case 6: // References & Submit
                if (formData.references.length === 0) newErrors.references = 'At least one reference is required'
                if (!formData.dataConsent) newErrors.dataConsent = 'Data processing consent is required'
                if (!formData.termsConsent) newErrors.termsConsent = 'Terms and conditions acceptance is required'
                break
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return

        setIsSubmitting(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log('Application submitted:', formData)
            setSubmitSuccess(true)
            setTimeout(() => {
                router.push('/apply/thank-you')
            }, 2000)
        } catch (error) {
            console.error('Submission error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-secondary to-blue-primary rounded-full mb-4">
                                <Upload className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Upload Your Resume
                            </h3>
                            <p className="text-muted-foreground">We'll use this to pre-fill your application where possible</p>
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label htmlFor="resume" className="text-sm font-medium text-slate-700">Resume/CV *</Label>
                                        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50/50 hover:bg-blue-50 transition-colors">
                                            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                                            <div className="text-sm">
                                                <label htmlFor="resume" className="cursor-pointer text-blue-secondary hover:text-blue-primary font-medium">
                                                    Click to upload your resume
                                                </label>
                                                <span className="text-slate-500"> or drag and drop</span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX (max. 10MB)</p>
                                            <input
                                                type="file"
                                                id="resume"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) updateFormData('resume', file)
                                                }}
                                            />
                                            {formData.resume && (
                                                <div className="mt-4 p-3 bg-green-primary/10 border border-green-primary/20 rounded-lg">
                                                    <div className="flex items-center gap-2 text-green-primary">
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-sm font-medium">{formData.resume.name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.resume && <p className="text-sm text-red-600">{errors.resume}</p>}
                                    </div>

                                    {jobData.applicationForm.portfolio && (
                                        <div className="space-y-3">
                                            <Label htmlFor="portfolio" className="text-sm font-medium text-slate-700">Portfolio (Optional)</Label>
                                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                <FileText className="h-10 w-10 mx-auto mb-3 text-slate-400" />
                                                <div className="text-sm">
                                                    <label htmlFor="portfolio" className="cursor-pointer text-slate-600 hover:text-slate-700 font-medium">
                                                        Upload portfolio or work samples
                                                    </label>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">PDF, ZIP (max. 25MB)</p>
                                                <input
                                                    type="file"
                                                    id="portfolio"
                                                    className="hidden"
                                                    accept=".pdf,.zip"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) updateFormData('portfolio', file)
                                                    }}
                                                />
                                                {formData.portfolio && (
                                                    <div className="mt-4 p-3 bg-green-primary/10 border border-green-primary/20 rounded-lg">
                                                        <div className="flex items-center gap-2 text-green-primary">
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{formData.portfolio.name}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-primary to-green-secondary rounded-full mb-4">
                                <User className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Personal Information
                            </h3>
                            <p className="text-muted-foreground">Tell us about yourself</p>
                        </div>

                        <Card className="shadow-sm">
                            <CardContent className="p-6">
                                <div className="space-y-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">First Name *</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="firstName"
                                                    value={formData.firstName}
                                                    onChange={(e) => updateFormData('firstName', e.target.value)}
                                                    placeholder="Enter your first name"
                                                    className="pl-10 border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">Last Name *</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="lastName"
                                                    value={formData.lastName}
                                                    onChange={(e) => updateFormData('lastName', e.target.value)}
                                                    placeholder="Enter your last name"
                                                    className="pl-10 border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => updateFormData('email', e.target.value)}
                                                    placeholder="your.email@example.com"
                                                    className="pl-10 border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">Phone Number *</Label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    value={formData.phone}
                                                    onChange={(e) => updateFormData('phone', e.target.value)}
                                                    placeholder="+250 788 123 456"
                                                    className="pl-10 border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-slate-700">Date of Birth</Label>
                                            <Input
                                                id="dateOfBirth"
                                                type="date"
                                                value={formData.dateOfBirth}
                                                onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                                                className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nationality" className="text-sm font-medium text-slate-700">Nationality</Label>
                                            <Input
                                                id="nationality"
                                                value={formData.nationality}
                                                onChange={(e) => updateFormData('nationality', e.target.value)}
                                                placeholder="e.g., Rwandan"
                                                className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="address" className="text-sm font-medium text-slate-700">Address</Label>
                                            <div className="relative">
                                                <Home className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={(e) => updateFormData('address', e.target.value)}
                                                    placeholder="Street address"
                                                    className="pl-10 border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="city" className="text-sm font-medium text-slate-700">City</Label>
                                                <Input
                                                    id="city"
                                                    value={formData.city}
                                                    onChange={(e) => updateFormData('city', e.target.value)}
                                                    placeholder="e.g., Kigali"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country</Label>
                                                <Input
                                                    id="country"
                                                    value={formData.country}
                                                    onChange={(e) => updateFormData('country', e.target.value)}
                                                    placeholder="e.g., Rwanda"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-secondary to-blue-primary rounded-full mb-4">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Education Background
                            </h3>
                            <p className="text-muted-foreground">Share your educational qualifications</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-700">Education History</h4>
                            <Button
                                onClick={addEducation}
                                className="bg-blue-secondary hover:bg-blue-primary"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Education
                            </Button>
                        </div>

                        {errors.education && <p className="text-sm text-red-600">{errors.education}</p>}

                        <div className="space-y-4">
                            {formData.education.map((edu, index) => (
                                <Card key={edu.id} className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                Education Entry
                                            </CardTitle>
                                            {formData.education.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeEducation(edu.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Degree/Qualification</Label>
                                                <Input
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                    placeholder="e.g., Master of Science in Agriculture"
                                                    className="border-slate-200 focus:border-blue-secondary focus:ring-blue-secondary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Institution</Label>
                                                <Input
                                                    value={edu.institution}
                                                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                    placeholder="e.g., University of Rwanda"
                                                    className="border-slate-200 focus:border-blue-secondary focus:ring-blue-secondary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Year of Graduation</Label>
                                                <Input
                                                    value={edu.year}
                                                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                                                    placeholder="e.g., 2020"
                                                    className="border-slate-200 focus:border-blue-secondary focus:ring-blue-secondary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Grade/GPA</Label>
                                                <Input
                                                    value={edu.grade}
                                                    onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                                                    placeholder="e.g., First Class Honors, 3.8/4.0"
                                                    className="border-slate-200 focus:border-blue-secondary focus:ring-blue-secondary"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {formData.education.length === 0 && (
                                <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                                    <CardContent className="text-center py-12">
                                        <GraduationCap className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                                        <p className="text-lg font-medium text-slate-700 mb-2">No education entries added yet</p>
                                        <p className="text-sm text-slate-500 mb-4">Click "Add Education" to get started</p>
                                        <Button
                                            onClick={addEducation}
                                            className="bg-blue-secondary hover:bg-blue-primary"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Education
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-primary to-orange-500 rounded-full mb-4">
                                <Briefcase className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Work Experience
                            </h3>
                            <p className="text-muted-foreground">Share your professional journey</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-700">Professional Experience</h4>
                            <Button
                                onClick={addExperience}
                                className="bg-orange-primary hover:bg-orange-500"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Experience
                            </Button>
                        </div>

                        {errors.experience && <p className="text-sm text-red-600">{errors.experience}</p>}

                        <div className="space-y-4">
                            {formData.experience.map((exp, index) => (
                                <Card key={exp.id} className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                                <div className="w-8 h-8 bg-orange-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                Work Experience
                                            </CardTitle>
                                            {formData.experience.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeExperience(exp.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Job Title</Label>
                                                <Input
                                                    value={exp.title}
                                                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                    placeholder="e.g., Agricultural Extension Officer"
                                                    className="border-slate-200 focus:border-orange-primary focus:ring-orange-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Company/Organization</Label>
                                                <Input
                                                    value={exp.company}
                                                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                    placeholder="e.g., Ministry of Agriculture"
                                                    className="border-slate-200 focus:border-orange-primary focus:ring-orange-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Start Date</Label>
                                                <Input
                                                    type="date"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                    className="border-slate-200 focus:border-orange-primary focus:ring-orange-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">End Date</Label>
                                                <Input
                                                    type="date"
                                                    value={exp.endDate}
                                                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                    disabled={exp.current}
                                                    className="border-slate-200 focus:border-orange-primary focus:ring-orange-primary"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`current-${exp.id}`}
                                                        checked={exp.current}
                                                        onCheckedChange={(checked) => updateExperience(exp.id, 'current', !!checked)}
                                                    />
                                                    <Label htmlFor={`current-${exp.id}`} className="text-sm font-normal">
                                                        I currently work here
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700">Job Description</Label>
                                            <Textarea
                                                value={exp.description}
                                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                placeholder="Describe your key responsibilities and achievements..."
                                                rows={4}
                                                className="border-slate-200 focus:border-orange-primary focus:ring-orange-primary"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {formData.experience.length === 0 && (
                                <Card className="border-2 border-dashed border-orange-200 bg-orange-50/30">
                                    <CardContent className="text-center py-12">
                                        <Briefcase className="h-16 w-16 mx-auto mb-4 text-orange-400" />
                                        <p className="text-lg font-medium text-slate-700 mb-2">No work experience entries added yet</p>
                                        <p className="text-sm text-slate-500 mb-4">Click "Add Experience" to get started</p>
                                        <Button
                                            onClick={addExperience}
                                            className="bg-orange-primary hover:bg-orange-500"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Experience
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                                <FileText className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                Cover Letter & Questions
                            </h3>
                            <p className="text-muted-foreground">Tell us why you're the perfect fit</p>
                        </div>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    Your Motivation
                                </CardTitle>
                                <CardDescription>
                                    Share your passion for this role and organization
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    <Label htmlFor="coverLetter" className="text-sm font-medium text-slate-700">
                                        Tell us why you're interested in this position *
                                    </Label>
                                    <Textarea
                                        id="coverLetter"
                                        value={formData.coverLetter}
                                        onChange={(e) => updateFormData('coverLetter', e.target.value)}
                                        placeholder="Write your cover letter here. Explain why you're interested in this position and how your experience makes you a good fit..."
                                        rows={12}
                                        className="border-slate-200 focus:border-purple-500 focus:ring-purple-500"
                                    />
                                    {errors.coverLetter && <p className="text-sm text-red-600">{errors.coverLetter}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {jobData.applicationForm.customQuestions.length > 0 && (
                            <Card className="shadow-sm">
                                <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg border-b">
                                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-indigo-500" />
                                        Additional Questions
                                    </CardTitle>
                                    <CardDescription>
                                        Help us understand your specific qualifications
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-6">
                                        {jobData.applicationForm.customQuestions.map((question) => (
                                            <div key={question.id} className="space-y-3">
                                                <Label htmlFor={`custom-${question.id}`} className="text-sm font-medium text-slate-700">
                                                    {question.question}
                                                    {question.required && <span className="text-red-500 ml-1">*</span>}
                                                </Label>

                                                {question.type === 'textarea' && (
                                                    <Textarea
                                                        id={`custom-${question.id}`}
                                                        value={formData.customAnswers[question.id] || ''}
                                                        onChange={(e) => updateFormData('customAnswers', {
                                                            ...formData.customAnswers,
                                                            [question.id]: e.target.value
                                                        })}
                                                        rows={4}
                                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                )}

                                                {question.type === 'select' && question.options && (
                                                    <Select
                                                        value={formData.customAnswers[question.id] || ''}
                                                        onValueChange={(value) => updateFormData('customAnswers', {
                                                            ...formData.customAnswers,
                                                            [question.id]: value
                                                        })}
                                                    >
                                                        <SelectTrigger className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                                                            <SelectValue placeholder="Select an option" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {question.options.map((option) => (
                                                                <SelectItem key={option} value={option}>
                                                                    {option}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}

                                                {question.type === 'text' && (
                                                    <Input
                                                        id={`custom-${question.id}`}
                                                        value={formData.customAnswers[question.id] || ''}
                                                        onChange={(e) => updateFormData('customAnswers', {
                                                            ...formData.customAnswers,
                                                            [question.id]: e.target.value
                                                        })}
                                                        className="border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )

            case 6:
                return (
                    <div className="space-y-8">
                        <div className="text-center space-y-3">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-primary to-green-secondary rounded-full mb-4">
                                <CheckCircle className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800">
                                References & Submit
                            </h3>
                            <p className="text-muted-foreground">Almost done! Add your references and submit</p>
                        </div>

                        <div className="flex items-center justify-between">
                            <h4 className="font-medium text-slate-700">Professional References</h4>
                            <Button
                                onClick={addReference}
                                className="bg-green-primary hover:bg-green-secondary"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Reference
                            </Button>
                        </div>

                        {errors.references && <p className="text-sm text-red-600">{errors.references}</p>}

                        <div className="space-y-4">
                            {formData.references.map((ref, index) => (
                                <Card key={ref.id} className="shadow-sm">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                                <div className="w-8 h-8 bg-green-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    {index + 1}
                                                </div>
                                                Reference
                                            </CardTitle>
                                            {formData.references.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeReference(ref.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                                                <Input
                                                    value={ref.name}
                                                    onChange={(e) => updateReference(ref.id, 'name', e.target.value)}
                                                    placeholder="e.g., Dr. John Smith"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Position/Title</Label>
                                                <Input
                                                    value={ref.position}
                                                    onChange={(e) => updateReference(ref.id, 'position', e.target.value)}
                                                    placeholder="e.g., Senior Agricultural Advisor"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Company/Organization</Label>
                                                <Input
                                                    value={ref.company}
                                                    onChange={(e) => updateReference(ref.id, 'company', e.target.value)}
                                                    placeholder="e.g., Ministry of Agriculture"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Relationship</Label>
                                                <Input
                                                    value={ref.relationship}
                                                    onChange={(e) => updateReference(ref.id, 'relationship', e.target.value)}
                                                    placeholder="e.g., Former Supervisor"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Email</Label>
                                                <Input
                                                    type="email"
                                                    value={ref.email}
                                                    onChange={(e) => updateReference(ref.id, 'email', e.target.value)}
                                                    placeholder="reference@example.com"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-slate-700">Phone Number</Label>
                                                <Input
                                                    value={ref.phone}
                                                    onChange={(e) => updateReference(ref.id, 'phone', e.target.value)}
                                                    placeholder="+250 788 123 456"
                                                    className="border-slate-200 focus:border-green-primary focus:ring-green-primary"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {formData.references.length === 0 && (
                                <Card className="border-2 border-dashed border-green-200 bg-green-50/30">
                                    <CardContent className="text-center py-12">
                                        <Users className="h-16 w-16 mx-auto mb-4 text-green-400" />
                                        <p className="text-lg font-medium text-slate-700 mb-2">No references added yet</p>
                                        <p className="text-sm text-slate-500 mb-4">Add professional references who can speak to your qualifications</p>
                                        <Button
                                            onClick={addReference}
                                            className="bg-green-primary hover:bg-green-secondary"
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add Your First Reference
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <Card className="shadow-sm">
                            <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-t-lg border-b">
                                <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-primary" />
                                    Consent & Agreements
                                </CardTitle>
                                <CardDescription>
                                    Please review and accept the following terms
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-slate-200">
                                        <Checkbox
                                            id="dataConsent"
                                            checked={formData.dataConsent}
                                            onCheckedChange={(checked) => updateFormData('dataConsent', !!checked)}
                                            className="mt-0.5"
                                        />
                                        <div className="text-sm">
                                            <Label htmlFor="dataConsent" className="font-normal cursor-pointer">
                                                I consent to GanzAfrica processing my personal data for recruitment purposes in accordance with their privacy policy. *
                                            </Label>
                                        </div>
                                    </div>
                                    {errors.dataConsent && <p className="text-sm text-red-600 ml-7">{errors.dataConsent}</p>}

                                    <div className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-slate-200">
                                        <Checkbox
                                            id="termsConsent"
                                            checked={formData.termsConsent}
                                            onCheckedChange={(checked) => updateFormData('termsConsent', !!checked)}
                                            className="mt-0.5"
                                        />
                                        <div className="text-sm">
                                            <Label htmlFor="termsConsent" className="font-normal cursor-pointer">
                                                I confirm that all information provided is accurate and complete. I understand that any false information may result in disqualification from the recruitment process. *
                                            </Label>
                                        </div>
                                    </div>
                                    {errors.termsConsent && <p className="text-sm text-red-600 ml-7">{errors.termsConsent}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {submitSuccess && (
                            <Alert className="border-green-primary/20 bg-green-primary/10 shadow-lg">
                                <CheckCircle className="h-4 w-4 text-green-primary" />
                                <AlertDescription className="text-green-primary">
                                    Your application has been submitted successfully! You will receive a confirmation email shortly.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )

            default:
                return null
        }
    }

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center py-16">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-primary to-green-secondary rounded-full shadow-lg">
                                <CheckCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-800 mb-4">
                            Application Submitted!
                        </h1>
                        <p className="text-xl text-slate-600 mb-8">
                            Thank you for applying to <strong className="text-green-primary">{jobData.title}</strong> at GanzAfrica.
                        </p>
                        <Card className="text-left shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
                            <CardContent className="p-8">
                                <h2 className="font-semibold text-lg mb-4 text-slate-800">What happens next?</h2>
                                <div className="space-y-3 text-slate-600">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-primary rounded-full"></div>
                                        <p>You'll receive a confirmation email within 24 hours</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-secondary rounded-full"></div>
                                        <p>Our HR team will review your application within 5-7 business days</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <p>If shortlisted, we'll contact you to schedule an interview</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-orange-primary rounded-full"></div>
                                        <p>You can check your application status anytime using the link in your email</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <div className="space-y-4">
                            <Button asChild className="bg-green-primary hover:bg-green-secondary shadow-lg">
                                <Link href="/applicant-check">
                                    Check Application Status
                                </Link>
                            </Button>
                            <div>
                                <Link href="/" className="text-sm text-green-primary hover:text-green-secondary font-medium">
                                    ← Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-primary to-green-secondary rounded-full">
                                <Building className="h-5 w-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-800">
                                GanzAfrica
                            </span>
                        </div>
                    </div>

                    {/* Job Info Card */}
                    <Card className="mb-6 border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-green-primary to-green-secondary text-white rounded-t-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-2xl text-white">{jobData.title}</CardTitle>
                                    <CardDescription className="mt-1 text-white/90">
                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-white/20 bg-white/10 ${getDepartmentColor(jobData.department).replace('bg-', 'text-').replace('text-emerald-800', 'text-white').replace('border-emerald-200', 'border-white/20')}`}>
                                            <Building className="h-3 w-3" />
                                            {jobData.department}
                                        </div>
                                    </CardDescription>
                                </div>
                                <Badge className="bg-white/20 text-white border-white/30 capitalize">
                                    {jobData.type}
                                </Badge>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-white/90 mt-4">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {jobData.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    {jobData.salary}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Apply by {new Date(jobData.applicationDeadline).toLocaleDateString()}
                                </div>
                            </div>
                        </CardHeader>
                    </Card>

                    {/* Progress Bar */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-slate-700">Step {currentStep} of {totalSteps}</span>
                            <span className="text-sm text-muted-foreground">
                                {Math.round((currentStep / totalSteps) * 100)}% complete
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
                            <div
                                className="bg-gradient-to-r from-green-primary to-blue-secondary h-3 rounded-full transition-all duration-500 shadow-sm"
                                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                            />
                        </div>

                        {/* Step Labels */}
                        <div className="flex justify-between mt-3 text-xs">
                            {['Upload CV', 'Personal', 'Education', 'Experience', 'Cover Letter', 'Submit'].map((label, index) => (
                                <span
                                    key={label}
                                    className={`font-medium transition-colors ${
                                        currentStep >= index + 1
                                            ? 'text-green-primary'
                                            : 'text-muted-foreground'
                                    }`}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <Card className="mb-8">
                    <CardContent className="p-8">
                        {renderStepContent()}
                    </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isSubmitting}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    <div className="text-sm text-muted-foreground hidden sm:block">
                        Step {currentStep} of {totalSteps}
                    </div>

                    {currentStep < totalSteps ? (
                        <Button
                            onClick={nextStep}
                            disabled={isSubmitting}
                        >
                            Next Step
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.dataConsent || !formData.termsConsent}
                        >
                            {isSubmitting ? (
                                <>
                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Submit Application
                                </>
                            )}
                        </Button>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-muted-foreground">
                    <p>Need help? Contact us at <a href="mailto:hr@ganzafrica.org" className="text-green-primary hover:underline font-medium">hr@ganzafrica.org</a></p>
                    <p className="mt-2">© 2024 GanzAfrica. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
}