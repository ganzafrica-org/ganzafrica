"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { KanbanBoard, KanbanColumn, KanbanItem } from "@/components/ui/kanban-board"
import {
    UserPlus,
    CheckCircle,
    Clock,
    Search,
    Download,
    Eye,
    Edit,
    MoreVertical,
    Plus,
    FileText,
    Calendar,
    User,
    Building,
    Mail,
    Phone,
    GraduationCap,
    Send,
    AlertCircle,
    Users,
    Briefcase,
    Laptop,
    Smartphone,
    Monitor,
    Package,
    TrendingUp, ChevronDown, ChevronRight
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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from "@/components/ui/collapsible";

const onboardingData = [
    {
        id: 1,
        employeeId: "GZ008",
        name: "Alice Uwimana",
        email: "alice.uwimana@ganzafrica.org",
        phone: "+250 788 111 222",
        position: "Environmental Analyst",
        department: "Environment",
        manager: "Grace Mukamana",
        buddy: "Marie Claire Nsengimana",
        hrContact: "Jean Baptiste Mukamana",
        startDate: "2024-12-20",
        status: "in_progress",
        stage: "documentation",
        progress: 60,
        jobId: "2", // Links to the job they were hired for
        templateId: "technical-onboarding",
        templateName: "Technical Role Onboarding",
        profileImage: "",
        contractSigned: true,
        contractSignedDate: "2024-12-18",
        tasks: [
            {
                id: 1,
                title: "Sign Employment Contract",
                type: "contract",
                status: "completed",
                dueDate: "2024-12-18",
                document: {
                    id: "contract-001",
                    name: "Standard Employment Contract",
                    type: "contract",
                    url: "/documents/contracts/standard-employment.pdf"
                },
                requiresSignature: true,
                completedDate: "2024-12-18",
                signedDocument: "/documents/signed/alice-contract.pdf"
            },
            {
                id: 2,
                title: "Complete personal information form",
                type: "form",
                status: "completed",
                dueDate: "2024-12-18",
                document: {
                    id: "form-001",
                    name: "Personal Information Form",
                    type: "form",
                    url: "/documents/forms/personal-info.pdf"
                },
                requiresSignature: false,
                completedDate: "2024-12-18"
            },
            {
                id: 3,
                title: "Read and acknowledge Employee Handbook",
                type: "document",
                status: "completed",
                dueDate: "2024-12-19",
                document: {
                    id: "policy-001",
                    name: "Employee Handbook 2024",
                    type: "policy",
                    url: "/documents/policies/employee-handbook.pdf"
                },
                requiresSignature: true,
                completedDate: "2024-12-19",
                signedDocument: "/documents/signed/alice-handbook.pdf"
            },
            {
                id: 4,
                title: "IT equipment setup",
                type: "asset",
                status: "in_progress",
                dueDate: "2024-12-20",
                assignedTo: "IT Department",
                assets: [
                    {
                        id: "laptop-001",
                        name: "Dell Latitude 5520",
                        type: "laptop",
                        assetTag: "GZ-LT-004",
                        status: "assigned"
                    },
                    {
                        id: "phone-001",
                        name: "iPhone 14",
                        type: "phone",
                        assetTag: "GZ-PH-004",
                        status: "pending"
                    }
                ]
            },
            {
                id: 5,
                title: "Sign Code of Conduct",
                type: "document",
                status: "pending",
                dueDate: "2024-12-21",
                document: {
                    id: "policy-002",
                    name: "Code of Conduct",
                    type: "policy",
                    url: "/documents/policies/code-of-conduct.pdf"
                },
                requiresSignature: true
            },
            {
                id: 6,
                title: "Office tour and introduction",
                type: "task",
                status: "pending",
                dueDate: "2024-12-21",
                assignedTo: "HR Team"
            },
            {
                id: 7,
                title: "Department orientation",
                type: "task",
                status: "pending",
                dueDate: "2024-12-22",
                assignedTo: "Grace Mukamana"
            },
            {
                id: 8,
                title: "Data Protection Policy Acknowledgment",
                type: "document",
                status: "pending",
                dueDate: "2024-12-23",
                document: {
                    id: "policy-003",
                    name: "Data Protection Policy",
                    type: "policy",
                    url: "/documents/policies/data-protection.pdf"
                },
                requiresSignature: true
            },
            {
                id: 9,
                title: "Complete compliance training",
                type: "training",
                status: "pending",
                dueDate: "2024-12-25"
            }
        ]
    },
    {
        id: 2,
        employeeId: "GZ009",
        name: "Robert Nkurunziza",
        email: "robert.nkurunziza@ganzafrica.org",
        phone: "+250 788 333 444",
        position: "Data Scientist",
        department: "Agriculture",
        manager: "David Nshimiyimana",
        buddy: "David Niyonkuru",
        hrContact: "Jean Baptiste Mukamana",
        startDate: "2024-12-22",
        status: "pending",
        stage: "pre_boarding",
        progress: 25,
        jobId: "1", // Links to the job they were hired for
        templateId: "technical-onboarding",
        templateName: "Technical Role Onboarding",
        profileImage: "",
        contractSigned: false,
        tasks: [
            {
                id: 1,
                title: "Welcome email sent",
                type: "communication",
                status: "completed",
                dueDate: "2024-12-15",
                completedDate: "2024-12-15"
            },
            {
                id: 2,
                title: "Send employment contract for signature",
                type: "contract",
                status: "in_progress",
                dueDate: "2024-12-20",
                document: {
                    id: "contract-002",
                    name: "Standard Employment Contract",
                    type: "contract",
                    url: "/documents/contracts/standard-employment.pdf"
                },
                requiresSignature: true
            },
            {
                id: 3,
                title: "Complete pre-boarding form",
                type: "form",
                status: "pending",
                dueDate: "2024-12-20"
            },
            {
                id: 4,
                title: "Background check verification",
                type: "verification",
                status: "pending",
                dueDate: "2024-12-21",
                assignedTo: "HR Team"
            },
            {
                id: 5,
                title: "Prepare workspace",
                type: "asset",
                status: "pending",
                dueDate: "2024-12-21",
                assignedTo: "Facilities",
                assets: [
                    {
                        id: "laptop-002",
                        name: "MacBook Pro 16",
                        type: "laptop",
                        assetTag: "GZ-LT-005",
                        status: "available"
                    },
                    {
                        id: "monitor-001",
                        name: "Dell UltraSharp Monitor",
                        type: "monitor",
                        assetTag: "GZ-MON-002",
                        status: "available"
                    }
                ]
            }
        ]
    },
    {
        id: 3,
        employeeId: "GZ010",
        name: "Sarah Mutesi",
        email: "sarah.mutesi@ganzafrica.org",
        phone: "+250 788 555 666",
        position: "Project Coordinator",
        department: "Land Management",
        manager: "Emmanuel Nshimiyimana",
        buddy: "Grace Mukamana",
        hrContact: "Jean Baptiste Mukamana",
        startDate: "2024-12-15",
        status: "completed",
        stage: "completed",
        progress: 100,
        jobId: "3",
        templateId: "general-onboarding",
        templateName: "General Employee Onboarding",
        profileImage: "",
        contractSigned: true,
        contractSignedDate: "2024-12-13",
        tasks: [
            {
                id: 1,
                title: "Sign Employment Contract",
                type: "contract",
                status: "completed",
                dueDate: "2024-12-13",
                completedDate: "2024-12-13",
                document: {
                    id: "contract-003",
                    name: "Standard Employment Contract",
                    type: "contract",
                    url: "/documents/contracts/standard-employment.pdf"
                },
                signedDocument: "/documents/signed/sarah-contract.pdf"
            },
            {
                id: 2,
                title: "Complete personal information form",
                type: "form",
                status: "completed",
                dueDate: "2024-12-14",
                completedDate: "2024-12-14"
            },
            {
                id: 3,
                title: "IT equipment setup",
                type: "asset",
                status: "completed",
                dueDate: "2024-12-15",
                completedDate: "2024-12-15",
                assets: [
                    {
                        id: "laptop-003",
                        name: "HP EliteBook 850",
                        type: "laptop",
                        assetTag: "GZ-LT-006",
                        status: "assigned"
                    }
                ]
            },
            {
                id: 4,
                title: "Office tour and introduction",
                type: "task",
                status: "completed",
                dueDate: "2024-12-16",
                completedDate: "2024-12-16"
            },
            {
                id: 5,
                title: "Department orientation",
                type: "task",
                status: "completed",
                dueDate: "2024-12-17",
                completedDate: "2024-12-17"
            },
            {
                id: 6,
                title: "Complete compliance training",
                type: "training",
                status: "completed",
                dueDate: "2024-12-18",
                completedDate: "2024-12-18"
            },
            {
                id: 7,
                title: "30-day check-in",
                type: "meeting",
                status: "completed",
                dueDate: "2024-12-19",
                completedDate: "2024-12-19"
            }
        ]
    }
]

const onboardingStages: KanbanColumn[] = [
    {
        id: "pre_boarding",
        title: "Pre-boarding",
        color: "#3b82f6",
        items: []
    },
    {
        id: "documentation",
        title: "Documentation",
        color: "#f59e0b",
        items: []
    },
    {
        id: "asset_assignment",
        title: "Asset Assignment",
        color: "#8b5cf6",
        items: []
    },
    {
        id: "orientation",
        title: "Orientation",
        color: "#f97316",
        items: []
    },
    {
        id: "training",
        title: "Training",
        color: "#10b981",
        items: []
    },
    {
        id: "completed",
        title: "Completed",
        color: "#059669",
        items: []
    }
]

const onboardingTemplates = [
    {
        id: 'general-onboarding',
        name: 'General Employee Onboarding',
        description: 'Standard onboarding template for all employees',
        estimatedTime: '2-3 hours',
        departments: ['All'],
        jobTypes: ['employment', 'fellowship'],
        tasks: [
            {
                name: 'Sign Employment Contract',
                type: 'contract',
                required: true,
                order: 1,
                documentId: 'contract-001',
                requiresSignature: true
            },
            {
                name: 'Personal Information Form',
                type: 'form',
                required: true,
                order: 2,
                documentId: 'form-001'
            },
            {
                name: 'Employee Handbook Acknowledgment',
                type: 'document',
                required: true,
                order: 3,
                documentId: 'policy-001',
                requiresSignature: true
            },
            {
                name: 'Code of Conduct Agreement',
                type: 'document',
                required: true,
                order: 4,
                documentId: 'policy-002',
                requiresSignature: true
            },
            {
                name: 'Basic IT Equipment Setup',
                type: 'asset',
                required: true,
                order: 5,
                assetTypes: ['laptop']
            },
            {
                name: 'Office Tour',
                type: 'task',
                required: true,
                order: 6
            }
        ]
    },
    {
        id: 'technical-onboarding',
        name: 'Technical Role Onboarding',
        description: 'Enhanced onboarding for technical positions',
        estimatedTime: '3-4 hours',
        departments: ['IT', 'Agriculture', 'Environment'],
        jobTypes: ['employment'],
        tasks: [
            {
                name: 'Sign Employment Contract',
                type: 'contract',
                required: true,
                order: 1,
                documentId: 'contract-001',
                requiresSignature: true
            },
            {
                name: 'Personal Information Form',
                type: 'form',
                required: true,
                order: 2,
                documentId: 'form-001'
            },
            {
                name: 'Employee Handbook Acknowledgment',
                type: 'document',
                required: true,
                order: 3,
                documentId: 'policy-001',
                requiresSignature: true
            },
            {
                name: 'Code of Conduct Agreement',
                type: 'document',
                required: true,
                order: 4,
                documentId: 'policy-002',
                requiresSignature: true
            },
            {
                name: 'Data Protection Policy',
                type: 'document',
                required: true,
                order: 5,
                documentId: 'policy-003',
                requiresSignature: true
            },
            {
                name: 'Technical Equipment Setup',
                type: 'asset',
                required: true,
                order: 6,
                assetTypes: ['laptop', 'monitor', 'phone']
            },
            {
                name: 'Technical Guidelines Review',
                type: 'document',
                required: true,
                order: 7,
                documentId: 'tech-001'
            },
            {
                name: 'Department Orientation',
                type: 'task',
                required: true,
                order: 8
            }
        ]
    },
    {
        id: 'fellowship-onboarding',
        name: 'Fellowship Onboarding',
        description: 'Specialized onboarding for fellows',
        estimatedTime: '1-2 hours',
        departments: ['Fellowship'],
        jobTypes: ['fellowship'],
        tasks: [
            {
                name: 'Sign Fellowship Agreement',
                type: 'contract',
                required: true,
                order: 1,
                documentId: 'fellowship-001',
                requiresSignature: true
            },
            {
                name: 'Program Guidelines Review',
                type: 'document',
                required: true,
                order: 2,
                documentId: 'fellowship-002'
            },
            {
                name: 'Code of Conduct Agreement',
                type: 'document',
                required: true,
                order: 3,
                documentId: 'policy-002',
                requiresSignature: true
            },
            {
                name: 'Basic Equipment Assignment',
                type: 'asset',
                required: false,
                order: 4,
                assetTypes: ['laptop']
            },
            {
                name: 'Mentor Assignment',
                type: 'task',
                required: false,
                order: 5
            },
            {
                name: 'Project Guidelines',
                type: 'document',
                required: true,
                order: 6,
                documentId: 'fellowship-003'
            }
        ]
    }
]

const getDepartmentColor = (department: string) => {
    switch (department.toLowerCase()) {
        case 'agriculture':
            return 'from-emerald-500 to-green-600'
        case 'environment':
            return 'from-blue-500 to-cyan-600'
        case 'land management':
            return 'from-amber-500 to-orange-600'
        case 'fellowship program':
            return 'from-purple-500 to-indigo-600'
        case 'hr':
            return 'from-pink-500 to-rose-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>
        case 'completed':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>
        case 'overdue':
            return <Badge className="bg-red-100 text-red-700 border-red-200">Overdue</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getTaskStatusBadge = (status: string) => {
    switch (status) {
        case 'completed':
            return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>
        case 'in_progress':
            return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>
        case 'pending':
            return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>
        case 'overdue':
            return <Badge className="bg-red-100 text-red-700 border-red-200">Overdue</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getTaskTypeIcon = (type: string) => {
    switch (type) {
        case 'contract':
            return <FileText className="h-4 w-4 text-blue-600" />
        case 'document':
            return <FileText className="h-4 w-4 text-purple-600" />
        case 'form':
            return <FileText className="h-4 w-4 text-green-600" />
        case 'asset':
            return <Package className="h-4 w-4 text-orange-600" />
        case 'task':
            return <CheckCircle className="h-4 w-4 text-cyan-600" />
        case 'training':
            return <GraduationCap className="h-4 w-4 text-indigo-600" />
        case 'meeting':
            return <Calendar className="h-4 w-4 text-pink-600" />
        case 'communication':
            return <Mail className="h-4 w-4 text-emerald-600" />
        default:
            return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
}

const getAssetIcon = (type: string) => {
    switch (type) {
        case 'laptop':
            return <Laptop className="h-4 w-4 text-blue-600" />
        case 'phone':
            return <Smartphone className="h-4 w-4 text-green-600" />
        case 'monitor':
            return <Monitor className="h-4 w-4 text-purple-600" />
        default:
            return <Package className="h-4 w-4 text-gray-600" />
    }
}

export default function OnboardingPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [stageFilter, setStageFilter] = useState("all")
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showNewOnboardingDialog, setShowNewOnboardingDialog] = useState(false)
    const [onboardingDataState, setOnboardingDataState] = useState(onboardingData)
    const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)

    const handleTemplateToggle = (templateId: string) => {
        // If clicking on the already expanded template, collapse it
        // If clicking on a different template, expand it (and collapse the previous one)
        setExpandedTemplate(expandedTemplate === templateId ? null : templateId)
    }


    const convertToKanbanItems = (data: typeof onboardingData): KanbanColumn[] => {
        const columns = [...onboardingStages]

        columns.forEach(column => {
            column.items = data
                .filter(emp => emp.stage === column.id)
                .filter(emp => {
                    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
                    const matchesStatus = statusFilter === "all" || emp.status === statusFilter
                    return matchesSearch && matchesStatus
                })
                .map(emp => ({
                    id: emp.id.toString(),
                    title: emp.name,
                    subtitle: emp.position,
                    description: `${emp.department} • ${emp.templateName}`,
                    status: emp.stage,
                    metadata: {
                        email: emp.email,
                        phone: emp.phone,
                        startDate: emp.startDate,
                        progress: emp.progress,
                        manager: emp.manager,
                        contractSigned: emp.contractSigned,
                        documentsCount: emp.tasks.filter(t => t.type === 'document' || t.type === 'contract').length,
                        assetsCount: emp.tasks.filter(t => t.type === 'asset').length
                    },
                    tags: [emp.department, `${emp.progress}% complete`],
                    date: emp.startDate
                }))
        })

        return columns
    }

    const [kanbanData, setKanbanData] = useState<KanbanColumn[]>(convertToKanbanItems(onboardingDataState))

    React.useEffect(() => {
        setKanbanData(convertToKanbanItems(onboardingDataState))
    }, [searchTerm, statusFilter, onboardingDataState])

    const handleItemClick = (item: KanbanItem) => {
        const employee = onboardingDataState.find(emp => emp.id.toString() === item.id)
        if (employee) {
            setSelectedEmployee(employee)
            setShowDetailsDialog(true)
        }
    }

    const handleItemMove = (itemId: string, fromColumn: string, toColumn: string) => {
        const updatedData = onboardingDataState.map(emp => {
            if (emp.id.toString() === itemId) {
                return { ...emp, stage: toColumn }
            }
            return emp
        })

        setOnboardingDataState(updatedData)
        console.log(`Moved employee ${itemId} from ${fromColumn} to ${toColumn}`)
    }

    const filteredOnboarding = onboardingDataState.filter(record => {
        const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || record.status === statusFilter
        const matchesStage = stageFilter === "all" || record.stage === stageFilter
        return matchesSearch && matchesStatus && matchesStage
    })

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">

            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Active Onboarding</CardTitle>
                        <UserPlus className="h-5 w-5 text-emerald-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {onboardingDataState.filter(emp => emp.status !== 'completed').length}
                        </div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            <span className="text-emerald-200">
                                {onboardingDataState.filter(emp => emp.status === 'in_progress').length}
                            </span> in progress
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Documents Pending</CardTitle>
                        <FileText className="h-5 w-5 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {onboardingDataState.reduce((count, emp) =>
                                    count + emp.tasks.filter(task =>
                                        (task.type === 'document' || task.type === 'contract') &&
                                        task.status === 'pending'
                                    ).length, 0
                            )}
                        </div>
                        <p className="text-xs text-blue-100">Awaiting signature</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-sm  hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Assets to Assign</CardTitle>
                        <Package className="h-5 w-5 text-amber-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {onboardingDataState.reduce((count, emp) =>
                                    count + emp.tasks.filter(task =>
                                        task.type === 'asset' &&
                                        task.status !== 'completed'
                                    ).length, 0
                            )}
                        </div>
                        <p className="text-xs text-amber-100">Equipment setup needed</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Avg. Completion Time</CardTitle>
                        <Clock className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">12</div>
                        <p className="text-xs text-purple-100">Days average</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="pipeline" className="space-y-6">
                <TabsList className="bg-white shadow-sm border">
                    <TabsTrigger value="pipeline" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                        Onboarding Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="active" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                        Active Onboarding
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                        Job-Based Templates
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                        Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pipeline" className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search employees..."
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
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={() => setShowNewOnboardingDialog(true)}>
                                <Plus className="h-4 w-4" />
                                New Onboarding
                            </Button>
                            </div>
                        </CardContent>
                    </Card>

         <Card>
             <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-t-lg border-b">
                 <CardTitle className="flex items-center gap-2 text-xl">
                     <Users className="h-6 w-6 text-emerald-600" />
                     Onboarding Pipeline
                 </CardTitle>
                 <CardDescription>
                     Drag and drop employees between stages to update their status
                 </CardDescription>
             </CardHeader>
             <CardContent className="p-6">
                    <KanbanBoard
                        columns={kanbanData}
                        onItemMove={handleItemMove}
                        onItemClick={handleItemClick}
                        className="min-h-[600px]"
                    />
             </CardContent>
         </Card>
                </TabsContent>

                <TabsContent value="active" className="space-y-6">
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search employees..."
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
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={stageFilter} onValueChange={setStageFilter}>
                                        <SelectTrigger className="w-[180px] border-slate-200">
                                            <SelectValue placeholder="Stage" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Stages</SelectItem>
                                            <SelectItem value="pre_boarding">Pre-boarding</SelectItem>
                                            <SelectItem value="documentation">Documentation</SelectItem>
                                            <SelectItem value="asset_assignment">Asset Assignment</SelectItem>
                                            <SelectItem value="orientation">Orientation</SelectItem>
                                            <SelectItem value="training">Training</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                        <Download className="h-4 w-4" />
                                        Export
                                    </Button>
                                    <Button onClick={() => setShowNewOnboardingDialog(true)}>
                                        <Plus className="h-4 w-4" />
                                        New Onboarding
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredOnboarding.map((employee) => (
                            <Card key={employee.id} className="hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-14 w-14">
                                                <AvatarImage src={employee.profileImage} />
                                                <AvatarFallback className={`bg-gradient-to-br ${getDepartmentColor(employee.department)} text-white font-semibold`}>
                                                    {employee.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-lg text-slate-800">{employee.name}</CardTitle>
                                                <CardDescription className="text-slate-600">{employee.position}</CardDescription>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {getStatusBadge(employee.status)}
                                                    {!employee.contractSigned && (
                                                        <Badge className="bg-red-100 text-red-700 border-red-200">
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                            Contract Pending
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => {
                                                    setSelectedEmployee(employee)
                                                    setShowDetailsDialog(true)
                                                }}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Progress
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Send className="mr-2 h-4 w-4" />
                                                    Send Reminder
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    Generate Report
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700">Progress</span>
                                            <span className="font-semibold text-emerald-600">{employee.progress}%</span>
                                        </div>
                                        <Progress
                                            value={employee.progress}
                                            className="h-1 bg-slate-100"
                                        />
                                    </div>

                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Calendar className="h-4 w-4 text-emerald-500" />
                                            <span>Start Date: {employee.startDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Building className="h-4 w-4 text-blue-500" />
                                            <span>{employee.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <User className="h-4 w-4 text-purple-500" />
                                            <span>Manager: {employee.manager}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <GraduationCap className="h-4 w-4 text-amber-500" />
                                            <span>Template: {employee.templateName}</span>
                                        </div>
                                    </div>

                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                                <span className="text-xs font-medium text-blue-700">Documents</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold text-blue-800">
                                                    {employee.tasks.filter(t => (t.type === 'document' || t.type === 'contract') && t.status === 'completed').length}
                                                </span>
                                                <span className="text-blue-600">
                                                    /{employee.tasks.filter(t => t.type === 'document' || t.type === 'contract').length} signed
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Package className="h-4 w-4 text-orange-600" />
                                                <span className="text-xs font-medium text-orange-700">Assets</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-semibold text-orange-800">
                                                    {employee.tasks.filter(t => t.type === 'asset' && t.status === 'completed').length}
                                                </span>
                                                <span className="text-orange-600">
                                                    /{employee.tasks.filter(t => t.type === 'asset').length} assigned
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-sm font-medium text-slate-700">Contract Status:</span>
                                        {employee.contractSigned ? (
                                            <div className="flex items-center gap-1 text-emerald-600">
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">Signed</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-600">
                                                <AlertCircle className="h-4 w-4" />
                                                <span className="text-sm font-medium">Pending</span>
                                            </div>
                                        )}
                                    </div>

                                    
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                                            onClick={() => {
                                                setSelectedEmployee(employee)
                                                setShowDetailsDialog(true)
                                            }}
                                        >
                                            <Eye className="h-3 w-3" />
                                            View
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Update
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="templates" className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-800">Job-Based Onboarding Templates</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Templates automatically assigned based on the job position and department
                                    </p>
                                </div>
                                <Button>
                                    <Plus className="h-4 w-4" />
                                    New Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        {onboardingTemplates.map((template) => (
                            <Card key={template.id} className="overflow-hidden">
                                <Collapsible
                                    open={expandedTemplate === template.id}
                                    onOpenChange={() => handleTemplateToggle(template.id)}
                                >
                                    <CollapsibleTrigger asChild>
                                        <CardHeader className={`${expandedTemplate === template.id ? 'bg-emerald-50' : 'bg-white'} hover:bg-emerald-50 border-b cursor-pointer transition-all duration-200 group`}>
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className="mt-1 transition-transform duration-200">
                                                        {expandedTemplate === template.id ? (
                                                            <ChevronDown className="h-5 w-5 text-slate-600" />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5 text-slate-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <CardTitle className="text-xl text-slate-800 group-hover:text-slate-900 transition-colors">
                                                            {template.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1 text-slate-600">
                                                            {template.description}
                                                        </CardDescription>
                                                        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                                                            <div className="flex items-center gap-1">
                                                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                                                <span>{template.tasks.length} tasks</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-4 w-4 text-blue-500" />
                                                                <span>{template.estimatedTime}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Building className="h-4 w-4 text-purple-500" />
                                                                <span>{template.departments.join(', ')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Briefcase className="h-4 w-4 text-amber-500" />
                                                                <span>{template.jobTypes.join(', ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Template
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Users className="mr-2 h-4 w-4" />
                                                            Assign to Job
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600">
                                                            <AlertCircle className="mr-2 h-4 w-4" />
                                                            Delete Template
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="p-6">
                                            <div className="space-y-6">
                                                {/* Task Type Summary */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="h-5 w-5 text-blue-600" />
                                                            <span className="font-medium text-blue-800">Documents</span>
                                                        </div>
                                                        <div className="text-sm text-blue-700">
                                                            {template.tasks.filter(t => t.type === 'document' || t.type === 'contract').length} documents to sign
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Package className="h-5 w-5 text-orange-600" />
                                                            <span className="font-medium text-orange-800">Assets</span>
                                                        </div>
                                                        <div className="text-sm text-orange-700">
                                                            {template.tasks.filter(t => t.type === 'asset').length} asset assignments
                                                        </div>
                                                    </div>

                                                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                            <span className="font-medium text-emerald-800">Tasks</span>
                                                        </div>
                                                        <div className="text-sm text-emerald-700">
                                                            {template.tasks.filter(t => t.type === 'task' || t.type === 'training').length} general tasks
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Task Sequence */}
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-800">Task Sequence:</h4>
                                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                                        {template.tasks.slice(0, 8).map((task, index) => (
                                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 text-white text-xs font-bold">
                                                            {task.order}
                                                        </span>
                                                                {getTaskTypeIcon(task.type)}
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-medium text-slate-800">{task.name}</span>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {task.required && <Badge className="bg-red-100 text-red-700 text-xs">Required</Badge>}
                                                                        {task.requiresSignature && <Badge className="bg-blue-100 text-blue-700 text-xs">Signature</Badge>}
                                                                        {task.assetTypes && (
                                                                            <Badge className="bg-orange-100 text-orange-700 text-xs">
                                                                                Assets: {task.assetTypes.join(', ')}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {template.tasks.length > 8 && (
                                                            <div className="text-xs text-muted-foreground text-center py-2">
                                                                +{template.tasks.length - 8} more tasks...
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-3 pt-4 border-t">
                                                    <Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                                                        <Eye className="mr-2 h-3 w-3" />
                                                        Preview Template
                                                    </Button>
                                                    <Button variant="outline" className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50">
                                                        <Edit className="mr-2 h-3 w-3" />
                                                        Edit Template
                                                    </Button>
                                                    <Button variant="outline" className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50">
                                                        <Users className="mr-2 h-3 w-3" />
                                                        Assign to Jobs
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-emerald-700">Completion Rate</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-emerald-600">94%</div>
                                <p className="text-sm text-muted-foreground mt-2">Last 6 months</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-blue-700">Average Time</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-blue-600">12</div>
                                <p className="text-sm text-muted-foreground mt-2">Days to complete</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="text-center">
                                <CardTitle className="text-purple-700">Document Signing</CardTitle>
                            </CardHeader>
                            <CardContent className="text-center">
                                <div className="text-4xl font-bold text-purple-600">2.3</div>
                                <p className="text-sm text-muted-foreground mt-2">Avg days to sign</p>
                            </CardContent>
                        </Card>
                    </div>

                    
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-slate-800">Document Completion by Type</CardTitle>
                                <CardDescription>Document signing rates across categories</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { type: 'Employment Contracts', completed: 95, total: 100, color: 'bg-green-primary' },
                                    { type: 'Policy Documents', completed: 87, total: 95, color: 'bg-blue-secondary' },
                                    { type: 'Technical Guidelines', completed: 92, total: 98, color: 'bg-purple-500' },
                                    { type: 'Compliance Forms', completed: 89, total: 94, color: 'bg-orange-primary' }
                                ].map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700">{item.type}</span>
                                            <span className="text-slate-600">{item.completed}/{item.total}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                                                style={{ width: `${(item.completed / item.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-slate-800">Asset Assignment Status</CardTitle>
                                <CardDescription>Equipment assignment across departments</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { department: 'Agriculture', laptops: 8, phones: 6, monitors: 4, total: 18 },
                                    { department: 'Environment', laptops: 5, phones: 4, monitors: 3, total: 12 },
                                    { department: 'Land Management', laptops: 3, phones: 3, monitors: 2, total: 8 },
                                    { department: 'Fellowship', laptops: 2, phones: 1, monitors: 1, total: 4 }
                                ].map((dept, index) => (
                                    <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-medium text-slate-800">{dept.department}</span>
                                            <span className="text-sm text-slate-600">{dept.total} assets</span>
                                        </div>
                                        <div className="flex gap-4 text-xs text-slate-600">
                                            <div className="flex items-center gap-1">
                                                <Laptop className="h-3 w-3" />
                                                <span>{dept.laptops}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Smartphone className="h-3 w-3" />
                                                <span>{dept.phones}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Monitor className="h-3 w-3" />
                                                <span>{dept.monitors}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            
            {showDetailsDialog && selectedEmployee && (
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">Onboarding Details - {selectedEmployee.name}</DialogTitle>
                            <DialogDescription>
                                Complete onboarding progress with document and asset management
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={selectedEmployee.profileImage} />
                                            <AvatarFallback className={`bg-gradient-to-br ${getDepartmentColor(selectedEmployee.department)} text-white text-lg font-bold`}>
                                                {selectedEmployee.name.split(' ').map((n: string) => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-800">{selectedEmployee.name}</h3>
                                            <p className="text-lg text-slate-600">{selectedEmployee.position}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getStatusBadge(selectedEmployee.status)}
                                                {!selectedEmployee.contractSigned && (
                                                    <Badge className="bg-red-100 text-red-700 border-red-200">
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                        Contract Pending
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-blue-500" />
                                            <span className="text-slate-700">{selectedEmployee.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-emerald-500" />
                                            <span className="text-slate-700">{selectedEmployee.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-purple-500" />
                                            <span className="text-slate-700">{selectedEmployee.department}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-amber-500" />
                                            <span className="text-slate-700">Start Date: {selectedEmployee.startDate}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-indigo-500" />
                                            <span className="text-slate-700">Employee ID: {selectedEmployee.employeeId}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                                        <h4 className="font-semibold text-slate-800 mb-3">Onboarding Progress</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-700">Overall Progress</span>
                                                <span className="font-bold text-emerald-600">{selectedEmployee.progress}%</span>
                                            </div>
                                            <Progress value={selectedEmployee.progress} className="h-3" />
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Template:</span>
                                            <span className="font-medium text-slate-800">{selectedEmployee.templateName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Manager:</span>
                                            <span className="font-medium text-slate-800">{selectedEmployee.manager}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Onboarding Buddy:</span>
                                            <span className="font-medium text-slate-800">{selectedEmployee.buddy}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">HR Contact:</span>
                                            <span className="font-medium text-slate-800">{selectedEmployee.hrContact}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Contract Status:</span>
                                            <span className={`font-medium ${selectedEmployee.contractSigned ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {selectedEmployee.contractSigned ? `Signed (${selectedEmployee.contractSignedDate})` : 'Pending Signature'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="space-y-4">
                                <h4 className="font-semibold text-slate-800 text-lg">Onboarding Tasks</h4>
                                <div className="space-y-3">
                                    {selectedEmployee.tasks.map((task: any) => (
                                        <div key={task.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3 flex-1">
                                                    <Checkbox
                                                        checked={task.status === 'completed'}
                                                        disabled={task.status === 'completed'}
                                                        className="mt-1"
                                                    />
                                                    {getTaskTypeIcon(task.type)}
                                                    <div className="flex-1">
                                                        <p className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-slate-800'}`}>
                                                            {task.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <span>Due: {task.dueDate}</span>
                                                            {task.document && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Document: {task.document.name}</span>
                                                                </>
                                                            )}
                                                            {task.assignedTo && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Assigned to: {task.assignedTo}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {task.completedDate && (
                                                            <p className="text-xs text-emerald-600 mt-1">
                                                                Completed: {task.completedDate}
                                                            </p>
                                                        )}

                                                        
                                                        {task.assets && task.assets.length > 0 && (
                                                            <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                                                                <p className="text-xs font-medium text-orange-800 mb-1">Assets:</p>
                                                                <div className="space-y-1">
                                                                    {task.assets.map((asset: any, index: number) => (
                                                                        <div key={index} className="flex items-center gap-2 text-xs">
                                                                            {getAssetIcon(asset.type)}
                                                                            <span className="text-orange-700">{asset.name} ({asset.assetTag})</span>
                                                                            <Badge className={`text-xs ${asset.status === 'assigned' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                                                {asset.status}
                                                                            </Badge>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        
                                                        {task.document && (
                                                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <FileText className="h-3 w-3 text-blue-600" />
                                                                        <span className="text-xs text-blue-800">{task.document.name}</span>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                                            <Eye className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                                                            <Download className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                                {task.signedDocument && (
                                                                    <div className="mt-1 text-xs text-emerald-600">
                                                                        ✓ Signed document available
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getTaskStatusBadge(task.status)}
                                                    {task.requiresSignature && (
                                                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                                                            <FileText className="h-3 w-3 mr-1" />
                                                            Signature
                                                        </Badge>
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            
                            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <h4 className="font-medium text-slate-800">Add Progress Note</h4>
                                <Textarea
                                    placeholder="Add notes about onboarding progress, document issues, or asset assignments..."
                                    rows={3}
                                    className="border-slate-200"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                Close
                            </Button>
                            <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                                <Send className="mr-2 h-4 w-4" />
                                Send Reminder
                            </Button>
                            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                                <Edit className="mr-2 h-4 w-4" />
                                Update Progress
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            
            <Dialog open={showNewOnboardingDialog} onOpenChange={setShowNewOnboardingDialog}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Create New Onboarding</DialogTitle>
                        <DialogDescription>
                            Set up onboarding for a new hire with automatic template assignment
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Employee Name *</Label>
                                <Input placeholder="Full name" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Employee ID</Label>
                                <Input placeholder="e.g., GZ011" className="border-slate-200" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input type="email" placeholder="employee@ganzafrica.org" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input placeholder="+250 788 123 456" className="border-slate-200" />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Position *</Label>
                                <Input placeholder="Job title" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Department *</Label>
                                <Select>
                                    <SelectTrigger className="border-slate-200">
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
                                <Label>Start Date *</Label>
                                <Input type="date" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Job ID</Label>
                                <Input placeholder="Link to job posting" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Onboarding Template *</Label>
                                <Select>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue placeholder="Auto-assigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {onboardingTemplates.map((template) => (
                                            <SelectItem key={template.id} value={template.id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Reporting Manager</Label>
                                <Input placeholder="Manager name" className="border-slate-200" />
                            </div>
                            <div className="space-y-2">
                                <Label>Onboarding Buddy</Label>
                                <Input placeholder="Buddy name" className="border-slate-200" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>HR Contact</Label>
                            <Select>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Select HR contact" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jean.mukamana">Jean Baptiste Mukamana</SelectItem>
                                    <SelectItem value="alice.uwimana">Alice Uwimana</SelectItem>
                                    <SelectItem value="sarah.johnson">Sarah Johnson</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <Label className="text-base font-medium text-blue-800">Integration Settings</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sendContract" defaultChecked />
                                    <Label htmlFor="sendContract" className="text-sm text-blue-700">
                                        Send employment contract for signature
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="autoAssignTasks" defaultChecked />
                                    <Label htmlFor="autoAssignTasks" className="text-sm text-blue-700">
                                        Auto-assign tasks from job template
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="prepareAssets" defaultChecked />
                                    <Label htmlFor="prepareAssets" className="text-sm text-blue-700">
                                        Prepare required assets for assignment
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="sendWelcome" defaultChecked />
                                    <Label htmlFor="sendWelcome" className="text-sm text-blue-700">
                                        Send welcome email with documents
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="notifyManager" defaultChecked />
                                    <Label htmlFor="notifyManager" className="text-sm text-blue-700">
                                        Notify manager and buddy
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="createDocuments" defaultChecked />
                                    <Label htmlFor="createDocuments" className="text-sm text-blue-700">
                                        Generate personalized documents
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Additional Notes</Label>
                            <Textarea
                                placeholder="Any special instructions, asset requirements, or notes for this onboarding..."
                                rows={3}
                                className="border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewOnboardingDialog(false)}>
                            Cancel
                        </Button>
                        <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Onboarding
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}