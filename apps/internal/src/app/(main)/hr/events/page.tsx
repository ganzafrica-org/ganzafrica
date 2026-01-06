"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Calendar as CalendarIcon,
    Users,
    MapPin,
    Clock,
    Search,
    Download,
    Eye,
    Edit,
    MoreVertical,
    Plus,
    Share2,
    Video,
    Building,
    TrendingUp,
    CheckCircle,
    UserCheck,
    Globe,
    Image as ImageIcon
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format, addDays } from "date-fns"

const eventsData = [
    {
        id: 1,
        title: "Climate Change Workshop",
        description: "Comprehensive workshop on climate adaptation strategies for agricultural communities in Rwanda",
        type: "Workshop",
        format: "in_person",
        date: "2024-12-20",
        startTime: "09:00",
        endTime: "17:00",
        location: "Kigali Conference Center",
        onlineLink: "",
        status: "upcoming",
        capacity: 100,
        registered: 72,
        targetAudience: ["staff", "fellows", "alumni"],
        organizer: "Environment Team",
        banner: "/api/placeholder/400/200",
        tags: ["climate", "agriculture", "adaptation"],
        attendees: [
            { name: "Marie Claire Nsengimana", email: "marie.nsengimana@ganzafrica.org", status: "confirmed" },
            { name: "David Niyonkuru", email: "david.niyonkuru@ganzafrica.org", status: "pending" },
            { name: "Grace Mukamana", email: "grace.mukamana@ganzafrica.org", status: "confirmed" }
        ]
    },
    {
        id: 2,
        title: "Youth Leadership Webinar",
        description: "Online leadership development session for young professionals and fellows",
        type: "Webinar",
        format: "online",
        date: "2024-12-15",
        startTime: "14:00",
        endTime: "16:00",
        location: "",
        onlineLink: "https://zoom.us/j/123456789",
        status: "completed",
        capacity: 50,
        registered: 43,
        targetAudience: ["fellows", "youth_alumni"],
        organizer: "Fellowship Program",
        banner: "/api/placeholder/400/200",
        tags: ["leadership", "youth", "development"],
        attendees: [
            { name: "David Niyonkuru", email: "david.niyonkuru@ganzafrica.org", status: "attended" },
            { name: "Alice Uwimana", email: "alice.uwimana@ganzafrica.org", status: "attended" }
        ]
    },
    {
        id: 3,
        title: "Annual General Meeting",
        description: "Annual organizational meeting for all staff members and board of directors",
        type: "Meeting",
        format: "hybrid",
        date: "2025-01-15",
        startTime: "09:00",
        endTime: "12:00",
        location: "GanzAfrica Head Office",
        onlineLink: "https://teams.microsoft.com/l/meetup-join/...",
        status: "upcoming",
        capacity: 200,
        registered: 85,
        targetAudience: ["all_staff", "board_members"],
        organizer: "Management Team",
        banner: "/api/placeholder/400/200",
        tags: ["annual", "meeting", "organizational"],
        attendees: []
    },
    {
        id: 4,
        title: "Sustainable Agriculture Training",
        description: "Hands-on training session for farmers on sustainable agriculture practices",
        type: "Training",
        format: "in_person",
        date: "2024-12-28",
        startTime: "08:00",
        endTime: "16:00",
        location: "Musanze Agricultural Center",
        onlineLink: "",
        status: "upcoming",
        capacity: 60,
        registered: 45,
        targetAudience: ["agriculture_staff", "external_farmers"],
        organizer: "Agriculture Department",
        banner: "/api/placeholder/400/200",
        tags: ["agriculture", "training", "sustainability"],
        attendees: []
    }
]

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'upcoming':
            return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Upcoming</Badge>
        case 'ongoing':
            return <Badge className="bg-green-100 text-green-800 border-green-200">Ongoing</Badge>
        case 'completed':
            return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Completed</Badge>
        case 'cancelled':
            return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

const getFormatBadge = (format: string) => {
    switch (format) {
        case 'online':
            return <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                <Video className="h-3 w-3" />
                Online
            </Badge>
        case 'in_person':
            return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 flex items-center gap-1">
                <Building className="h-3 w-3" />
                In Person
            </Badge>
        case 'hybrid':
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Hybrid
            </Badge>
        default:
            return <Badge variant="outline">{format}</Badge>
    }
}

const getTypeBadge = (type: string) => {
    const colors = {
        'Workshop': 'bg-blue-100 text-blue-800 border-blue-200',
        'Webinar': 'bg-purple-100 text-purple-800 border-purple-200',
        'Meeting': 'bg-gray-100 text-gray-800 border-gray-200',
        'Training': 'bg-green-100 text-green-800 border-green-200',
        'Conference': 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{type}</Badge>
}

export default function EventsPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [typeFilter, setTypeFilter] = useState("all")
    const [formatFilter, setFormatFilter] = useState("all")
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)

    const filteredEvents = eventsData.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || event.status === statusFilter
        const matchesType = typeFilter === "all" || event.type === typeFilter
        const matchesFormat = formatFilter === "all" || event.format === formatFilter
        return matchesSearch && matchesStatus && matchesType && matchesFormat
    })

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
            <div className="max-w-full space-y-6">
                
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
                            Events Management
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                        <Button
                            onClick={() => setShowCreateDialog(true)}
                        >
                            <Plus className="h-4 w-4" />
                            Create Event
                        </Button>
                    </div>
                </div>

                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-emerald-100">Total Events</CardTitle>
                            <CalendarIcon className="h-5 w-5 text-emerald-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">124</div>
                            <p className="text-xs text-emerald-100">
                                This year
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-blue-100">Upcoming Events</CardTitle>
                            <Clock className="h-5 w-5 text-blue-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">8</div>
                            <p className="text-xs text-blue-100 flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                Next 30 days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-amber-100">Total Attendees</CardTitle>
                            <Users className="h-5 w-5 text-amber-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">2,847</div>
                            <p className="text-xs text-amber-100">
                                This year registrations
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-purple-100">Attendance Rate</CardTitle>
                            <UserCheck className="h-5 w-5 text-purple-200" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">89%</div>
                            <p className="text-xs text-purple-100">
                                Average attendance
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="events" className="space-y-6">
                    <TabsList className="bg-white shadow-sm border w-full">
                        <TabsTrigger value="events" className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Events
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Calendar View
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="events" className="space-y-6">
                        
                        <Card >
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                                        <div className="relative flex-1 max-w-sm">
                                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search events..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                            />
                                        </div>
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[130px] border-slate-200">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                                <SelectItem value="cancelled">Cancelled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="w-[130px] border-slate-200">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="Workshop">Workshop</SelectItem>
                                                <SelectItem value="Webinar">Webinar</SelectItem>
                                                <SelectItem value="Meeting">Meeting</SelectItem>
                                                <SelectItem value="Training">Training</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={formatFilter} onValueChange={setFormatFilter}>
                                            <SelectTrigger className="w-[130px] border-slate-200">
                                                <SelectValue placeholder="Format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Formats</SelectItem>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="in_person">In Person</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredEvents.map((event) => (
                                <Card key={event.id} className="hover:shadow-md transition-all duration-300 border border-slate-200 group">
                                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center">
                                            <ImageIcon className="h-12 w-12 text-blue-400" />
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            {getStatusBadge(event.status)}
                                        </div>
                                    </div>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2 flex-1">
                                                <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                                                    {event.title}
                                                </CardTitle>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {getTypeBadge(event.type)}
                                                    {getFormatBadge(event.format)}
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
                                                        setSelectedEvent(event)
                                                        setShowDetailsDialog(true)
                                                    }}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit Event
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Share2 className="mr-2 h-4 w-4" />
                                                        Share Event
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Manage Attendees
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                                            {event.description}
                                        </p>

                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                {format(new Date(event.date), "MMMM d, yyyy")}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Clock className="h-4 w-4 text-emerald-500" />
                                                {event.startTime} - {event.endTime}
                                            </div>
                                            {event.format !== 'online' && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin className="h-4 w-4 text-orange-500" />
                                                    {event.location}
                                                </div>
                                            )}
                                            {event.format !== 'in_person' && event.onlineLink && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Video className="h-4 w-4 text-purple-500" />
                                                    Online Link Available
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Users className="h-4 w-4 text-amber-500" />
                                                {event.registered}/{event.capacity} registered
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-muted-foreground">Registration</span>
                                                <span className="text-xs font-medium">
                                                    {Math.round((event.registered / event.capacity) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-emerald-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                                                onClick={() => {
                                                    setSelectedEvent(event)
                                                    setShowDetailsDialog(true)
                                                }}
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                View
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                                            >
                                                <Share2 className="h-3 w-3 mr-1" />
                                                Share
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="space-y-6">
                        <Card className="shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                                    Events Calendar
                                </CardTitle>
                                <CardDescription>Monthly view of all scheduled events</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="text-center py-8 text-muted-foreground">
                                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                                    <p className="text-lg font-medium">Interactive Calendar View</p>
                                    <p className="text-sm">Full calendar with event scheduling and management</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        Event Metrics
                                    </CardTitle>
                                    <CardDescription>Key performance indicators</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 border rounded-lg">
                                            <span className="text-sm font-medium">Average Attendance</span>
                                            <span className="text-lg font-bold text-green-600">89%</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border rounded-lg">
                                            <span className="text-sm font-medium">Events This Month</span>
                                            <span className="text-lg font-bold text-blue-600">12</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 border rounded-lg">
                                            <span className="text-sm font-medium">Total Registrations</span>
                                            <span className="text-lg font-bold text-purple-600">2,847</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="shadow-sm">
                                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Upcoming Events
                                    </CardTitle>
                                    <CardDescription>Next scheduled events</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-3">
                                        {eventsData.filter(e => e.status === 'upcoming').slice(0, 3).map((event) => (
                                            <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                                <div>
                                                    <p className="font-medium text-sm">{event.title}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(event.date), "MMM d")} • {event.startTime}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {event.registered}/{event.capacity}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                
                {showCreateDialog && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Plus className="h-5 w-5 text-green-600" />
                                    Create New Event
                                </DialogTitle>
                                <DialogDescription>
                                    Set up a new event for your organization
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Basic Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Event Title</Label>
                                            <Input id="title" placeholder="Enter event title" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Event Type</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="workshop">Workshop</SelectItem>
                                                    <SelectItem value="webinar">Webinar</SelectItem>
                                                    <SelectItem value="meeting">Meeting</SelectItem>
                                                    <SelectItem value="training">Training</SelectItem>
                                                    <SelectItem value="conference">Conference</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" placeholder="Describe the event purpose and agenda" rows={3} />
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Date & Time</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input id="date" type="date" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="startTime">Start Time</Label>
                                            <Input id="startTime" type="time" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="endTime">End Time</Label>
                                            <Input id="endTime" type="time" />
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Format & Location</h4>
                                    <div className="space-y-2">
                                        <Label>Event Format</Label>
                                        <Select>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="in_person">In Person</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Physical Location</Label>
                                            <Input id="location" placeholder="Enter venue address" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="onlineLink">Online Meeting Link</Label>
                                            <Input id="onlineLink" placeholder="Zoom/Teams link" />
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Target Audience</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="all_staff" />
                                                <Label htmlFor="all_staff">All Staff Members</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="management" />
                                                <Label htmlFor="management">Management Team</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="agriculture_staff" />
                                                <Label htmlFor="agriculture_staff">Agriculture Department</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="environment_staff" />
                                                <Label htmlFor="environment_staff">Environment Department</Label>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="fellows" />
                                                <Label htmlFor="fellows">Current Fellows</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="alumni" />
                                                <Label htmlFor="alumni">Alumni Network</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="board_members" />
                                                <Label htmlFor="board_members">Board Members</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="external" />
                                                <Label htmlFor="external">External Participants</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Event Settings</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="capacity">Maximum Capacity</Label>
                                            <Input id="capacity" type="number" placeholder="100" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="organizer">Event Organizer</Label>
                                            <Input id="organizer" placeholder="Department or team name" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tags">Tags (comma separated)</Label>
                                        <Input id="tags" placeholder="agriculture, training, sustainability" />
                                    </div>
                                </div>

                                
                                <div className="space-y-4">
                                    <h4 className="font-medium">Event Banner</h4>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                        <div className="text-center">
                                            <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                            <p className="text-sm text-gray-600">Click to upload event banner</p>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 2MB (1200x600 recommended)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button variant="outline">
                                    Save as Draft
                                </Button>
                                <Button className="bg-gradient-to-r from-green-primary to-green-secondary hover:from-green-600 hover:to-green-700 text-white">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Create Event
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                
                {showDetailsDialog && selectedEvent && (
                    <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                                    {selectedEvent.title}
                                </DialogTitle>
                                <DialogDescription>
                                    Event details and attendee management
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                
                                <div className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 to-emerald-100">
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="h-16 w-16 text-blue-400" />
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        {getStatusBadge(selectedEvent.status)}
                                    </div>
                                </div>

                                
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Event Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                    <span>{format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy")}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-emerald-500" />
                                                    <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                                                </div>
                                                {selectedEvent.format !== 'online' && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-orange-500" />
                                                        <span>{selectedEvent.location}</span>
                                                    </div>
                                                )}
                                                {selectedEvent.format !== 'in_person' && selectedEvent.onlineLink && (
                                                    <div className="flex items-center gap-2">
                                                        <Video className="h-4 w-4 text-purple-500" />
                                                        <a href={selectedEvent.onlineLink} className="text-blue-600 hover:underline">
                                                            Join Online Meeting
                                                        </a>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-amber-500" />
                                                    <span>{selectedEvent.registered}/{selectedEvent.capacity} registered</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Event Type & Format</h4>
                                            <div className="flex gap-2">
                                                {getTypeBadge(selectedEvent.type)}
                                                {getFormatBadge(selectedEvent.format)}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Description</h4>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {selectedEvent.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Organizer</h4>
                                            <p className="text-sm">{selectedEvent.organizer}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Target Audience</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedEvent.targetAudience.map((audience: string, index: number) => (
                                                    <Badge key={index} variant="outline" className="text-xs">
                                                        {audience.replace('_', ' ')}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Tags</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedEvent.tags.map((tag: string, index: number) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        #{tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Registration Progress</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>Registered</span>
                                                    <span>{selectedEvent.registered}/{selectedEvent.capacity}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-emerald-500 to-blue-600 h-2 rounded-full"
                                                        style={{ width: `${(selectedEvent.registered / selectedEvent.capacity) * 100}%` }}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {Math.round((selectedEvent.registered / selectedEvent.capacity) * 100)}% capacity filled
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Recent Attendees</h4>
                                        <div className="space-y-2">
                                            {selectedEvent.attendees.slice(0, 5).map((attendee: any, index: number) => (
                                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-green-100 text-green-600 text-xs">
                                                                {attendee.name.split(' ').map((n: string) => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-sm">{attendee.name}</p>
                                                            <p className="text-xs text-muted-foreground">{attendee.email}</p>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={`text-xs ${
                                                            attendee.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                                attendee.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {attendee.status}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button variant="outline" className="flex-1">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share Event
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <Users className="h-4 w-4 mr-2" />
                                        Manage Attendees
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export Data
                                    </Button>
                                </div>
                            </div>
                            <DialogFooter className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-b-lg">
                                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                                    Close
                                </Button>
                                <Button className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Event
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}