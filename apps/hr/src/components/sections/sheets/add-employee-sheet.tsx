'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronLeft, ChevronRight, Check, User, Briefcase, CheckCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card } from "@/components/ui/card"
import { ReusableSheet } from "@/components/sections/sheets/sheet-component"
import { useMutation } from "@tanstack/react-query"
import { useCreateEmployee } from "@/hooks/useEmployees"
import type { CreateEmployeeRequest } from "@/types/api"

interface StepConfig {
    id: StepType
    title: string
    subtitle: string
    icon: React.ReactNode
}

type StepType = 'personalDetails' | 'jobDetails' | 'contractDetails' | 'reviewCreate'

const STEPS: StepConfig[] = [
    {
        id: 'personalDetails',
        title: 'Personal Details',
        subtitle: 'Basic personal info',
        icon: <User className="w-5 h-5" />,
    },
    {
        id: 'jobDetails',
        title: 'Job Details',
        subtitle: 'Role & workplace',
        icon: <Briefcase className="w-5 h-5" />,
    },
    {
        id: 'contractDetails',
        title: 'Contract Details',
        subtitle: 'Terms & compensation',
        icon: <FileText className="w-5 h-5" />,
    },
    {
        id: 'reviewCreate',
        title: 'Review & Create',
        subtitle: 'Confirm and submit',
        icon: <CheckCircle className="w-5 h-5" />,
    },
]


interface FormState {
    // Personal
    imageUrl: string
    firstName: string
    lastName: string
    email: string
    phone: string
    department: string
    workEmail: string
    citizenship: string
    homeCountry: string
    homeCity: string
    // Job
    jobTitle: string
    workLocation: string
    manager: string
    report: string
    // Contract
    startDate: string
    employmentTerm: 'indefinite' | 'definite' | ''
    contractEndDate: string
    employmentType: 'full-time' | 'part-time' | ''
    daysPerWeek: string
    compensationType: 'hourly' | 'salaried' | ''
    salaryScale: 'annual' | 'monthly' | 'weekly' | 'daily' | ''
    currency: string
    baseMonthlyRate: string
    grossAnnualRate: string
    employmentAgreement: 'upload' | 'skip' | ''
}

interface AddEmployeeSheetProps {
    open: boolean
    onOpenChange: (val: boolean) => void
}

interface AddEmployeeSheetProps {
    open: boolean
    onOpenChange: (val: boolean) => void
}

export const AddEmployeeSheet = ({ open, onOpenChange }: AddEmployeeSheetProps) => {
    const createEmployeeMutation = useCreateEmployee()
    const createContractMutation = useMutation({
        mutationFn: async (_payload: Record<string, unknown>) => {
            // Contract API not yet implemented
        },
    })
    const [currentStep, setCurrentStep] = useState<StepType>('personalDetails')
    const [formData, setFormData] = useState<FormState>({
        imageUrl: '', firstName: '', lastName: '', email: '', phone: '', workEmail: '', department: '',
        citizenship: '', homeCountry: '', homeCity: '', jobTitle: '', workLocation: '', manager: '', report: '',
        startDate: '', employmentTerm: '', contractEndDate: '', employmentType: '', daysPerWeek: '',
        compensationType: '', salaryScale: '', currency: '', baseMonthlyRate: '', grossAnnualRate: '', employmentAgreement: '',
    })

    // gross helper
    const handleBaseMonthlyChange = (val: string) => {
        const monthly = parseFloat(val)
        const annual = isNaN(monthly) ? '' : (monthly * 12).toFixed(2)
        setFormData(prev => ({ ...prev, baseMonthlyRate: val, grossAnnualRate: annual }))
    }

    const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

    // And wire up handleNext to call your API on the last step:
    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStep(STEPS[currentStepIndex + 1].id)
        } else {
            handleSubmit()   // call your create employee API here
        }
    }

    const handleSubmit = async () => {
        const employeePayload: CreateEmployeeRequest = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            personalEmail: formData.email,
            workEmail: formData.workEmail || undefined,
            phone: formData.phone || undefined,
            citizenship: formData.citizenship || undefined,
            homeCountry: formData.homeCountry || undefined,
            homeCity: formData.homeCity || undefined,
        }

        const employee = await createEmployeeMutation.mutateAsync(employeePayload)

        await createContractMutation.mutateAsync({
            employee_id: employee.id,
            job_title: formData.jobTitle,
            department: formData.department,
            work_location: formData.workLocation,
            manager: formData.manager,
            report_to: formData.report,
            start_date: formData.startDate,
            employment_term: formData.employmentTerm,
            end_date: formData.contractEndDate || null,
            employment_type: formData.employmentType,
            days_per_week: formData.daysPerWeek ? parseInt(formData.daysPerWeek) : null,
            compensation_type: formData.compensationType,
            salary_scale: formData.salaryScale,
            currency: formData.currency,
            base_monthly_rate: formData.baseMonthlyRate,
            gross_annual_rate: formData.grossAnnualRate,
            employment_agreement_url: null,
        })

        onOpenChange(false)
    }

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStep(STEPS[currentStepIndex - 1].id)
        }
    }

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const isStepCompleted = (stepIndex: number) => stepIndex < currentStepIndex
    const isStepActive = (stepIndex: number) => stepIndex === currentStepIndex

    return (
        <ReusableSheet open={open} onOpenChange={onOpenChange}>
            <div className="w-full max-w-[95%] h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-[280px_1fr] gap-0 h-full overflow-hidden">
                    {/* Left Sidebar - Stepper Navigation */}
                    <div className="bg-white py-8 flex flex-col rounded-l-lg overflow-hidden shrink-0 self-stretch">
                        <div className="space-y-8 h-full flex flex-col justify-center items-center border-r border-gray-100">
                            {STEPS.map((step, index) => {
                                const completed = isStepCompleted(index)
                                const active = isStepActive(index)

                                return (
                                    <div key={step.id}>
                                        {/* Step Item */}
                                        <motion.div
                                            onClick={() => {
                                                if (completed) {
                                                    setCurrentStep(step.id)
                                                }
                                            }}
                                            className={`flex items-start gap-4 cursor-pointer transition-opacity ${completed ? 'opacity-100' : 'opacity-100'
                                                }`}
                                            animate={{
                                                scale: active ? 1.05 : 1,
                                            }}
                                        >
                                            {/* Step Icon */}
                                            <motion.div
                                                animate={{
                                                    scale: active ? 1.1 : 1,
                                                }}
                                                style={{
                                                    backgroundColor: completed
                                                        ? 'var(--color-brand-accent)'
                                                        : active
                                                            ? 'var(--color-brand-accent)'
                                                            : '#E5E7EB',
                                                    opacity: active ? 1 : completed ? 1 : 0.6,
                                                }}
                                                transition={{ duration: 0.3 }}
                                                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-white"
                                            >
                                                {completed ? (
                                                    <Check className="w-6 h-6" />
                                                ) : (
                                                    <span className="text-sm font-semibold">
                                                        {active ? (
                                                            step.icon
                                                        ) : (
                                                            <span className="text-gray-600">{index + 1}</span>
                                                        )}
                                                    </span>
                                                )}
                                            </motion.div>

                                            {/* Step Text */}
                                            <div className="pt-1">
                                                <motion.h3
                                                    animate={{
                                                        fontWeight: active ? 700 : 600,
                                                        color: active ? '#1F2937' : '#6B7280',
                                                    }}
                                                    className="text-sm transition-colors"
                                                >
                                                    {step.title}
                                                </motion.h3>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {step.subtitle}
                                                </p>
                                            </div>
                                        </motion.div>

                                        {/* Connector Line */}
                                        {index < STEPS.length - 1 && (
                                            <motion.div
                                                style={{
                                                    backgroundColor: completed ? 'var(--color-white)' : '#E5E7EB',
                                                    height: 32,
                                                }}
                                                className="ml-4 w-0.5 my-2"
                                            />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="bg-white rounded-r-lg flex flex-col overflow-y-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="flex-1"
                            >
                                {/* ── STEP 1: PERSONAL DETAILS ── */}
                                {currentStep === 'personalDetails' && (
                                    <div className="space-y-5 p-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                                            <p className="text-sm text-gray-500 mt-1">Basic information about the employee</p>
                                        </div>
                                        <div className="mt-2 space-y-1.5">
                                            <Label>Upload your photo <span className="text-red-500">*</span></Label>
                                            <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-brand-accent/50 rounded-lg cursor-pointer hover:bg-brand-accent/5 transition-colors">
                                                <Upload className="h-5 w-5 text-brand-accent mb-1" />
                                                <span className="text-sm text-brand-accent font-medium">Click here or drag file to upload</span>
                                                <input type="file" accept=".pdf" className="hidden" />
                                            </label>
                                            <p className="text-xs text-gray-400">Supported format: PDF · Max size: 10MB</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label>First Name(s)</Label>
                                                <Input placeholder="e.g. John Michael"
                                                    value={formData.firstName}
                                                    onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Last Name</Label>
                                                <Input placeholder="e.g. Doe"
                                                    value={formData.lastName}
                                                    onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Personal Email</Label>
                                            <Input type="email" placeholder="john@gmail.com"
                                                value={formData.email}
                                                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Work Email</Label>
                                            <Input type="email" placeholder="john@company.com"
                                                value={formData.workEmail}
                                                onChange={e => setFormData(p => ({ ...p, workEmail: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Phone Number</Label>
                                            <Input type="email" placeholder="phone_number"
                                                   value={formData.phone}
                                                   onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label>Citizenship</Label>
                                            <Input placeholder="e.g. Rwandan"
                                                value={formData.citizenship}
                                                onChange={e => setFormData(p => ({ ...p, citizenship: e.target.value }))} />
                                        </div>
                                        <div>
                                            <Label className="mb-2 block text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Home Address (where they'll work from)
                                            </Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-gray-600">Country</Label>
                                                    <Input placeholder="e.g. Rwanda"
                                                        value={formData.homeCountry}
                                                        onChange={e => setFormData(p => ({ ...p, homeCountry: e.target.value }))} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs text-gray-600">City</Label>
                                                    <Input placeholder="e.g. Kigali"
                                                        value={formData.homeCity}
                                                        onChange={e => setFormData(p => ({ ...p, homeCity: e.target.value }))} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: JOB DETAILS ── */}
                                {currentStep === 'jobDetails' && (
                                    <div className="space-y-6 p-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                                            <p className="text-sm text-gray-500 mt-1">Role and workplace information</p>
                                        </div>

                                        {/* Role section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Job Title</Label>
                                                <Input placeholder="e.g. Software Engineer"
                                                    value={formData.jobTitle}
                                                    onChange={e => setFormData(p => ({ ...p, jobTitle: e.target.value }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Department</Label>
                                                <Select value={formData.department}
                                                    onValueChange={v => setFormData(p => ({ ...p, department: v }))}>
                                                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="burkina">IT</SelectItem>
                                                        <SelectItem value="rwanda">Finance</SelectItem>
                                                        <SelectItem value="ganza-head-office">Food System</SelectItem>
                                                        <SelectItem value="work-from-home">Land Survey</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Work Location</Label>
                                                <Select value={formData.workLocation}
                                                    onValueChange={v => setFormData(p => ({ ...p, workLocation: v }))}>
                                                    <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="burkina">Burkina</SelectItem>
                                                        <SelectItem value="rwanda">Rwanda</SelectItem>
                                                        <SelectItem value="ganza-head-office">Ganza Head Office</SelectItem>
                                                        <SelectItem value="work-from-home">Work From Home</SelectItem>
                                                        <SelectItem value="minagri">MINAGRI</SelectItem>
                                                        <SelectItem value="musanze">Musanze</SelectItem>
                                                        <SelectItem value="nla">NLA</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        {/* Workplace Info section */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Workplace Info</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Manager <span className="text-xs text-gray-400 font-normal">(approves leaves)</span></Label>
                                                <Input placeholder="e.g. Jane Smith"
                                                    value={formData.manager}
                                                    onChange={e => setFormData(p => ({ ...p, manager: e.target.value }))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Report To <span className="text-xs text-gray-400 font-normal">(who to report to)</span></Label>
                                                <Input placeholder="e.g. Alice Johnson"
                                                    value={formData.report}
                                                    onChange={e => setFormData(p => ({ ...p, report: e.target.value }))} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 3: CONTRACT DETAILS ── */}
                                {currentStep === 'contractDetails' && (
                                    <div className="space-y-6 p-6 overflow-y-auto">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Contract Details</h2>
                                            <p className="text-sm text-gray-500 mt-1">Employment terms and compensation</p>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label>Start Date</Label>
                                            <Input type="date"
                                                value={formData.startDate}
                                                onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} />
                                        </div>

                                        {/* Employment Terms */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employment Terms</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            {(['indefinite', 'definite'] as const).map(term => (
                                                <label key={term}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.employmentTerm === term ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200'
                                                        }`}>
                                                    <input type="radio" name="employmentTerm" value={term}
                                                        checked={formData.employmentTerm === term}
                                                        onChange={() => setFormData(p => ({ ...p, employmentTerm: term }))}
                                                        className="accent-brand-accent" />
                                                    <span className="text-sm font-medium capitalize">{term}</span>
                                                </label>
                                            ))}
                                            {formData.employmentTerm === 'definite' && (
                                                <div className="space-y-1.5 pl-1">
                                                    <Label>Contract End Date</Label>
                                                    <Input type="date"
                                                        value={formData.contractEndDate}
                                                        onChange={e => setFormData(p => ({ ...p, contractEndDate: e.target.value }))} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Employment Type */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employment Type</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            {(['full-time', 'part-time'] as const).map(type => (
                                                <label key={type}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.employmentType === type ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200'
                                                        }`}>
                                                    <input type="radio" name="employmentType" value={type}
                                                        checked={formData.employmentType === type}
                                                        onChange={() => setFormData(p => ({ ...p, employmentType: type }))}
                                                        className="accent-brand-accent" />
                                                    <span className="text-sm font-medium capitalize">{type}</span>
                                                </label>
                                            ))}
                                            {formData.employmentType === 'part-time' && (
                                                <div className="space-y-1.5 pl-1">
                                                    <Label>Days per week</Label>
                                                    <Input type="number" min="1" max="6" placeholder="e.g. 3"
                                                        value={formData.daysPerWeek}
                                                        onChange={e => setFormData(p => ({ ...p, daysPerWeek: e.target.value }))} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Compensation */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Compensation</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label>Type</Label>
                                                <Select value={formData.compensationType}
                                                    onValueChange={v => setFormData(p => ({ ...p, compensationType: v as any, salaryScale: '' }))}>
                                                    <SelectTrigger><SelectValue placeholder="Hourly or Salaried" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hourly">Hourly</SelectItem>
                                                        <SelectItem value="salaried">Salaried</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {formData.compensationType === 'salaried' && (
                                                <div className="space-y-1.5">
                                                    <Label>Scale</Label>
                                                    <Select value={formData.salaryScale}
                                                        onValueChange={v => setFormData(p => ({ ...p, salaryScale: v as any }))}>
                                                        <SelectTrigger><SelectValue placeholder="Annual / Monthly / Weekly / Daily" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="annual">Annual</SelectItem>
                                                            <SelectItem value="monthly">Monthly</SelectItem>
                                                            <SelectItem value="weekly">Weekly</SelectItem>
                                                            <SelectItem value="daily">Daily</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}
                                            <div className="space-y-1.5">
                                                <Label>Currency</Label>
                                                <Select value={formData.currency}
                                                    onValueChange={v => setFormData(p => ({ ...p, currency: v }))}>
                                                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            ['RWF', 'RWF - Rwandan Franc'],
                                                            ['USD', 'USD - US Dollar'],
                                                            ['EUR', 'EUR - Euro'],
                                                            ['GBP', 'GBP - British Pound'],
                                                            ['KES', 'KES - Kenyan Shilling'],
                                                            ['UGX', 'UGX - Ugandan Shilling'],
                                                            ['TZS', 'TZS - Tanzanian Shilling'],
                                                            ['XOF', 'XOF - West African CFA'],
                                                            ['ZAR', 'ZAR - South African Rand'],
                                                            ['NGN', 'NGN - Nigerian Naira'],
                                                            ['GHS', 'GHS - Ghanaian Cedi'],
                                                            ['ETB', 'ETB - Ethiopian Birr'],
                                                            ['JPY', 'JPY - Japanese Yen'],
                                                            ['CNY', 'CNY - Chinese Yuan'],
                                                            ['INR', 'INR - Indian Rupee'],
                                                            ['CAD', 'CAD - Canadian Dollar'],
                                                            ['AUD', 'AUD - Australian Dollar'],
                                                            ['CHF', 'CHF - Swiss Franc'],
                                                            ['AED', 'AED - UAE Dirham'],
                                                        ].map(([val, label]) => (
                                                            <SelectItem key={val} value={val}>{label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label>Base Monthly Rate</Label>
                                                    <Input type="number" placeholder="0.00"
                                                        value={formData.baseMonthlyRate}
                                                        onChange={e => handleBaseMonthlyChange(e.target.value)} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Gross Annual Rate</Label>
                                                    <Input readOnly placeholder="Auto-calculated"
                                                        value={formData.grossAnnualRate}
                                                        className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Employment Agreement */}
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-1 bg-gray-200" />
                                                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Employment Agreement</span>
                                                <div className="h-px flex-1 bg-gray-200" />
                                            </div>
                                            {(['upload', 'skip'] as const).map(opt => (
                                                <label key={opt}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.employmentAgreement === opt ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200'
                                                        }`}>
                                                    <input type="radio" name="employmentAgreement" value={opt}
                                                        checked={formData.employmentAgreement === opt}
                                                        onChange={() => setFormData(p => ({ ...p, employmentAgreement: opt }))}
                                                        className="accent-brand-accent" />
                                                    <span className="text-sm font-medium">
                                                        {opt === 'upload' ? 'Upload an employment agreement for now' : "Don't add an employment agreement for now"}
                                                    </span>
                                                </label>
                                            ))}
                                            {formData.employmentAgreement === 'upload' && (
                                                <div className="mt-2 space-y-1.5">
                                                    <Label>Upload your file <span className="text-red-500">*</span></Label>
                                                    <p className="text-xs text-gray-500">You can upload either a signed or unsigned version.</p>
                                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-brand-accent/50 rounded-lg cursor-pointer hover:bg-brand-accent/5 transition-colors">
                                                        <Upload className="h-5 w-5 text-brand-accent mb-1" />
                                                        <span className="text-sm text-brand-accent font-medium">Click here or drag file to upload</span>
                                                        <input type="file" accept=".pdf" className="hidden" />
                                                    </label>
                                                    <p className="text-xs text-gray-400">Supported format: PDF · Max size: 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 4: REVIEW & CREATE ── */}
                                {currentStep === 'reviewCreate' && (
                                    <div className="space-y-5 p-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">Review & Create</h2>
                                            <p className="text-sm text-gray-500 mt-1">Check everything before creating the employee</p>
                                        </div>

                                        {[
                                            {
                                                title: 'Personal Details',
                                                rows: [
                                                    ['Full Name', `${formData.firstName} ${formData.lastName}`.trim() || '—'],
                                                    ['Personal Email', formData.email || '—'],
                                                    ['Work Email', formData.workEmail || '—'],
                                                    ['Citizenship', formData.citizenship || '—'],
                                                    ['Home Address', [formData.homeCity, formData.homeCountry].filter(Boolean).join(', ') || '—'],
                                                ]
                                            },
                                            {
                                                title: 'Job Details',
                                                rows: [
                                                    ['Job Title', formData.jobTitle || '—'],
                                                    ['Work Location', formData.workLocation || '—'],
                                                    ['Manager', formData.manager || '—'],
                                                    ['Reports To', formData.report || '—'],
                                                ]
                                            },
                                            {
                                                title: 'Contract Details',
                                                rows: [
                                                    ['Start Date', formData.startDate || '—'],
                                                    ['Employment Term', formData.employmentTerm || '—'],
                                                    ...(formData.employmentTerm === 'definite' ? [['Contract End Date', formData.contractEndDate || '—'] as [string, string]] : []),
                                                    ['Employment Type', formData.employmentType || '—'],
                                                    ...(formData.employmentType === 'part-time' ? [['Days/Week', formData.daysPerWeek || '—'] as [string, string]] : []),
                                                    ['Compensation', formData.compensationType || '—'],
                                                    ['Currency', formData.currency || '—'],
                                                    ['Base Monthly Rate', formData.baseMonthlyRate ? `${formData.currency} ${formData.baseMonthlyRate}` : '—'],
                                                    ['Gross Annual Rate', formData.grossAnnualRate ? `${formData.currency} ${formData.grossAnnualRate}` : '—'],
                                                    ['Agreement', formData.employmentAgreement === 'upload' ? 'Will upload' : formData.employmentAgreement === 'skip' ? 'Skipped' : '—'],
                                                ]
                                            },
                                        ].map(section => (
                                            <div key={section.title} className="rounded-lg border border-gray-100 overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{section.title}</span>
                                                </div>
                                                {section.rows.map(([label, value]) => (
                                                    <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0">
                                                        <span className="text-sm text-gray-500">{label}</span>
                                                        <span className="text-sm font-medium text-gray-900 text-right max-w-[55%]">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Footer Navigation */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                            <Button
                                onClick={handlePrev}
                                variant="ghost"
                                disabled={currentStepIndex === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Prev
                            </Button>

                            <div className="flex gap-2 items-center">
                                {STEPS.map((_, index) => (
                                    <motion.div
                                        key={index}
                                        animate={{
                                            backgroundColor:
                                                index <= currentStepIndex ? '#4F46E5' : '#E5E7EB',
                                        }}
                                        className="h-2 rounded-full"
                                        style={{
                                            width: index <= currentStepIndex ? 24 : 8,
                                        }}
                                    />
                                ))}
                            </div>

                            <Button
                                onClick={handleNext}
                                className="gap-2 bg-black text-white hover:bg-gray-900"
                                // disabled={currentStepIndex === STEPS.length - 1}
                            >
                                {currentStepIndex === STEPS.length - 1 ? (
                                    <div onClick={handleSubmit}>
                                        <Check className="w-4 h-4" />
                                        Create Employee
                                    </div>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden p-6 space-y-6">
                    {/* Mobile Horizontal Stepper */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            {STEPS.map((step, index) => {
                                const completed = isStepCompleted(index)
                                const active = isStepActive(index)

                                return (
                                    <div
                                        key={step.id}
                                        className="flex-1 flex flex-col items-center"
                                    >
                                        <motion.div
                                            animate={{
                                                backgroundColor: completed
                                                    ? '#4F46E5'
                                                    : active
                                                        ? '#1F2937'
                                                        : '#E5E7EB',
                                            }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white mb-2"
                                        >
                                            {completed ? (
                                                <Check className="w-5 h-5" />
                                            ) : (
                                                <span className="text-xs font-bold">{index + 1}</span>
                                            )}
                                        </motion.div>
                                        <p className="text-xs font-semibold text-center text-gray-900">
                                            {step.title}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Mobile Progress Line */}
                        <div className="flex gap-1">
                            {STEPS.map((_, index) => (
                                <motion.div
                                    key={index}
                                    animate={{
                                        backgroundColor:
                                            index < currentStepIndex ? '#4F46E5' : '#E5E7EB',
                                    }}
                                    className="flex-1 h-1 rounded-full"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Mobile Form Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[300px]"
                        >
                            {currentStep === 'reviewCreate' && (
                                <div className="space-y-5 p-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Review & Create</h2>
                                        <p className="text-sm text-gray-500 mt-1">Check everything before creating the employee</p>
                                    </div>

                                    {[
                                        {
                                            title: 'Personal Details',
                                            rows: [
                                                ['Full Name', `${formData.firstName} ${formData.lastName}`.trim() || '—'],
                                                ['Personal Email', formData.email || '—'],
                                                ['Phone', formData.phone || '—'],
                                                ['Work Email', formData.workEmail || '—'],
                                                ['Citizenship', formData.citizenship || '—'],
                                                ['Home Address', [formData.homeCity, formData.homeCountry].filter(Boolean).join(', ') || '—'],
                                            ]
                                        },
                                        {
                                            title: 'Job Details',
                                            rows: [
                                                ['Job Title', formData.jobTitle || '—'],
                                                ['Work Location', formData.workLocation || '—'],
                                                ['Manager', formData.manager || '—'],
                                                ['Reports To', formData.report || '—'],
                                            ]
                                        },
                                        {
                                            title: 'Contract Details',
                                            rows: [
                                                ['Start Date', formData.startDate || '—'],
                                                ['Employment Term', formData.employmentTerm || '—'],
                                                ...(formData.employmentTerm === 'definite' ? [['Contract End Date', formData.contractEndDate || '—'] as [string, string]] : []),
                                                ['Employment Type', formData.employmentType || '—'],
                                                ...(formData.employmentType === 'part-time' ? [['Days/Week', formData.daysPerWeek || '—'] as [string, string]] : []),
                                                ['Compensation', formData.compensationType || '—'],
                                                ['Currency', formData.currency || '—'],
                                                ['Base Monthly Rate', formData.baseMonthlyRate ? `${formData.currency} ${formData.baseMonthlyRate}` : '—'],
                                                ['Gross Annual Rate', formData.grossAnnualRate ? `${formData.currency} ${formData.grossAnnualRate}` : '—'],
                                                ['Agreement', formData.employmentAgreement === 'upload' ? 'Will upload' : formData.employmentAgreement === 'skip' ? 'Skipped' : '—'],
                                            ]
                                        },
                                    ].map(section => (
                                        <div key={section.title} className="rounded-lg border border-gray-100 overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{section.title}</span>
                                            </div>
                                            {section.rows.map(([label, value]) => (
                                                <div key={label} className="flex justify-between items-center px-4 py-2.5 border-b border-gray-50 last:border-0">
                                                    <span className="text-sm text-gray-500">{label}</span>
                                                    <span className="text-sm font-medium text-gray-900 text-right max-w-[55%]">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Mobile Footer Navigation */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            onClick={handlePrev}
                            variant="outline"
                            className="flex-1"
                            disabled={currentStepIndex === 0}
                        >
                            Prev
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="flex-1 bg-black hover:bg-gray-900"
                            disabled={currentStepIndex === STEPS.length - 1}
                        >
                            {currentStepIndex === STEPS.length - 1 ? 'Launch' : 'Next'}
                        </Button>
                    </div>
                </div>
            </div>
        </ReusableSheet>
    )
}
