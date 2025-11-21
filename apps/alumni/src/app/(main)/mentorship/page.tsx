"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    Search,
    UserPlus,
    MessageSquare,
    Calendar,
    Target,
    Star,
    Award,
    Clock,
    MapPin,
    Building,
    Heart,
    Lightbulb,
    TrendingUp,
    CheckCircle,
    User,
    Plus,
    Download
} from "lucide-react"

// Dummy data for mentors
const mentorData = [
    {
        id: 1,
        name: "Emma Rodriguez",
        title: "CEO & Founder",
        company: "InnovateTech Solutions",
        location: "San Francisco, CA",
        avatar: null,
        expertise: ["Leadership", "Entrepreneurship", "Product Strategy", "Fundraising"],
        experience: "8+ years",
        mentees: 12,
        rating: 4.9,
        reviews: 24,
        graduationYear: 2018,
        bio: "Passionate about helping the next generation of entrepreneurs build impactful companies.",
        availability: "2-3 hours/week",
        languages: ["English", "Spanish"],
        industries: ["Technology", "SaaS", "AI"],
        specialties: ["Startup Strategy", "Team Building", "Investor Relations"],
        status: "Available"
    },
    {
        id: 2,
        name: "James Liu",
        title: "Senior Product Manager",
        company: "Google",
        location: "Mountain View, CA",
        avatar: null,
        expertise: ["Product Management", "Data Analysis", "User Research", "Agile"],
        experience: "6+ years",
        mentees: 8,
        rating: 4.8,
        reviews: 18,
        graduationYear: 2017,
        bio: "Helping product professionals build products that users love and businesses need.",
        availability: "1-2 hours/week",
        languages: ["English", "Mandarin"],
        industries: ["Technology", "Consumer Products"],
        specialties: ["Product Strategy", "Data-Driven Decisions", "User Experience"],
        status: "Available"
    },
    {
        id: 3,
        name: "Sarah Johnson",
        title: "UX Design Lead",
        company: "Spotify",
        location: "Stockholm, Sweden",
        avatar: null,
        expertise: ["UX Design", "User Research", "Design Systems", "Prototyping"],
        experience: "5+ years",
        mentees: 6,
        rating: 4.9,
        reviews: 15,
        graduationYear: 2021,
        bio: "Passionate about creating meaningful user experiences and growing design talent.",
        availability: "2-3 hours/week",
        languages: ["English", "Swedish"],
        industries: ["Technology", "Entertainment", "Media"],
        specialties: ["Design Leadership", "User Research", "Design Systems"],
        status: "Limited"
    },
    {
        id: 4,
        name: "David Williams",
        title: "Startup Founder",
        company: "EcoSolutions",
        location: "Kigali, Rwanda",
        avatar: null,
        expertise: ["Sustainability", "Business Development", "Social Impact", "Leadership"],
        experience: "4+ years",
        mentees: 10,
        rating: 4.7,
        reviews: 12,
        graduationYear: 2020,
        bio: "Committed to building sustainable businesses that create positive impact in Africa.",
        availability: "2-4 hours/week",
        languages: ["English", "Kinyarwanda", "French"],
        industries: ["Environmental", "Social Impact", "Agriculture"],
        specialties: ["Impact Measurement", "Sustainable Business Models", "African Markets"],
        status: "Available"
    }
]

// Dummy data for mentorship sessions/relationships
const mentorshipData = [
    {
        id: 1,
        mentor: "Emma Rodriguez",
        mentee: "Michael Chen",
        startDate: "2025-06-01",
        goals: ["Leadership Development", "Startup Strategy", "Team Building"],
        progress: 75,
        nextSession: "2025-08-20",
        status: "Active",
        sessionsCompleted: 6,
        totalSessions: 8
    },
    {
        id: 2,
        mentor: "James Liu",
        mentee: "Aisha Patel",
        startDate: "2025-05-15",
        goals: ["Product Management", "Career Transition", "Data Analysis"],
        progress: 60,
        nextSession: "2025-08-18",
        status: "Active",
        sessionsCompleted: 4,
        totalSessions: 6
    },
    {
        id: 3,
        mentor: "Sarah Johnson",
        mentee: "Robert Nkomo",
        startDate: "2025-07-01",
        goals: ["UX Leadership", "Design Systems", "Team Management"],
        progress: 40,
        nextSession: "2025-08-22",
        status: "Active",
        sessionsCompleted: 2,
        totalSessions: 5
    }
]

const getDepartmentColor = (industry: string) => {
    switch (industry.toLowerCase()) {
        case 'technology':
            return 'from-emerald-500 to-green-600'
        case 'environmental':
            return 'from-blue-500 to-cyan-600'
        case 'entertainment':
            return 'from-amber-500 to-orange-600'
        case 'social impact':
            return 'from-purple-500 to-indigo-600'
        case 'media':
            return 'from-pink-500 to-rose-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniMentorship() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedExpertise, setSelectedExpertise] = useState("all")
    const [selectedIndustry, setSelectedIndustry] = useState("all")
    const [availableOnly, setAvailableOnly] = useState(false)
    const [activeTab, setActiveTab] = useState("find-mentor")

    // Filter mentors based on search and filters
    const filteredMentors = mentorData.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesExpertise = selectedExpertise === "all" || mentor.expertise.includes(selectedExpertise)
        const matchesIndustry = selectedIndustry === "all" || mentor.industries.includes(selectedIndustry)
        const matchesAvailability = !availableOnly || mentor.status === "Available"

        return matchesSearch && matchesExpertise && matchesIndustry && matchesAvailability
    })

    // Get unique values for filters
    const expertiseAreas = [...new Set(mentorData.flatMap(m => m.expertise))].sort()
    const industries = [...new Set(mentorData.flatMap(m => m.industries))].sort()

    const MentorCard = ({mentor}: { mentor: typeof mentorData[0] }) => (
        <Card
            className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                        {mentor.avatar ? (
                            <AvatarImage src={mentor.avatar} alt={mentor.name}/>
                        ) : (
                            <AvatarFallback
                                className={`bg-gradient-to-br ${getDepartmentColor(mentor.industries[0])} text-white text-lg font-semibold`}>
                                {mentor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{mentor.name}</h3>
                                <p className="text-gray-600">{mentor.title}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Building className="h-4 w-4"/>
                                    {mentor.company}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-4 w-4"/>
                                    {mentor.location}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                                <Badge
                                    variant={mentor.status === 'Available' ? 'default' :
                                        mentor.status === 'Limited' ? 'secondary' : 'outline'}
                                    className={mentor.status === 'Available' ? 'bg-green-primary' : ''}
                                >
                                    {mentor.status}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                    <span className="text-sm font-medium">{mentor.rating}</span>
                                    <span className="text-xs text-gray-500">({mentor.reviews})</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mt-3 line-clamp-2">{mentor.bio}</p>

                        <div className="space-y-3 mt-4">
                            <div className="flex flex-wrap gap-1">
                                {mentor.expertise.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs">
                                        {skill}
                                    </Badge>
                                ))}
                                {mentor.expertise.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{mentor.expertise.length - 3} more
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4"/>
                                    <span>{mentor.mentees} mentees</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4"/>
                                    <span>{mentor.availability}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4"/>
                                    <span>{mentor.experience}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Badge variant="secondary" className="text-xs">
                                        Class of {mentor.graduationYear}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button className="flex-1 bg-green-primary hover:bg-green-600"
                                    disabled={mentor.status === 'Unavailable'}>
                                <UserPlus className="h-4 w-4 mr-2"/>
                                Request Mentorship
                            </Button>
                            <Button variant="outline" size="icon"
                                    className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                <MessageSquare className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const MentorshipRelationshipCard = ({relationship}: { relationship: typeof mentorshipData[0] }) => (
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900">{relationship.mentor} → {relationship.mentee}</h3>
                        <p className="text-sm text-gray-600">Started {new Date(relationship.startDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={relationship.status === 'Active' ? 'default' : 'secondary'}
                           className={relationship.status === 'Active' ? 'bg-green-primary' : ''}>
                        {relationship.status}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-gray-600">{relationship.progress}%</span>
                        </div>
                        <Progress value={relationship.progress} className="h-2"/>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium mb-2">Goals</h4>
                        <div className="flex flex-wrap gap-1">
                            {relationship.goals.map((goal) => (
                                <Badge key={goal} variant="outline" className="text-xs">
                                    {goal}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Sessions:</span>
                            <span className="ml-1 font-medium">
                                {relationship.sessionsCompleted}/{relationship.totalSessions}
                            </span>
                        </div>
                        <div>
                            <span className="text-gray-600">Next Session:</span>
                            <span className="ml-1 font-medium">
                                {new Date(relationship.nextSession).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline"
                                className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Calendar className="h-4 w-4 mr-2"/>
                            Schedule Session
                        </Button>
                        <Button size="sm" variant="outline"
                                className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                            <MessageSquare className="h-4 w-4 mr-2"/>
                            Message
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Mentorship
                        Program</h1>
                    <p className="text-gray-600">Connect with experienced alumni to accelerate your career growth</p>
                </div>
                <Button className="bg-green-primary hover:bg-green-600">
                    <Plus className="h-4 w-4 mr-2"/>
                    Become a Mentor
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Available Mentors</CardTitle>
                        <Users className="h-5 w-5 text-emerald-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{mentorData.length}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3"/>
                            +3 this month
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Active Relationships</CardTitle>
                        <Heart className="h-5 w-5 text-blue-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{mentorshipData.length}</div>
                        <p className="text-xs text-blue-100">Currently active</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Sessions Completed</CardTitle>
                        <Target className="h-5 w-5 text-amber-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {mentorshipData.reduce((acc, rel) => acc + rel.sessionsCompleted, 0)}
                        </div>
                        <p className="text-xs text-amber-100">Total sessions</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Average Rating</CardTitle>
                        <Star className="h-5 w-5 text-purple-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">4.8</div>
                        <p className="text-xs text-purple-100">Mentor satisfaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-white shadow-sm border w-full">
                    <TabsTrigger value="find-mentor"
                                 className="data-[state=active]:bg-green-primary data-[state=active]:text-white">
                        Find a Mentor
                    </TabsTrigger>
                    <TabsTrigger value="my-mentorships"
                                 className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white">
                        My Mentorships
                    </TabsTrigger>
                    <TabsTrigger value="resources"
                                 className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                        Resources
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="find-mentor" className="space-y-6">
                    {/* Search and Filters */}
                    <Card className="shadow-sm">
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {/* Search Bar */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        placeholder="Search by name, company, or expertise..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                                        <SelectTrigger className="border-slate-200">
                                            <SelectValue placeholder="Expertise"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Expertise</SelectItem>
                                            {expertiseAreas.map((area) => (
                                                <SelectItem key={area} value={area}>
                                                    {area}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                                        <SelectTrigger className="border-slate-200">
                                            <SelectValue placeholder="Industry"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Industries</SelectItem>
                                            {industries.map((industry) => (
                                                <SelectItem key={industry} value={industry}>
                                                    {industry}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        variant={availableOnly ? "default" : "outline"}
                                        onClick={() => setAvailableOnly(!availableOnly)}
                                        className={`justify-start ${availableOnly ? 'bg-green-primary hover:bg-green-600' : 'border-green-primary text-green-primary hover:bg-green-primary hover:text-white'}`}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2"/>
                                        Available Only
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm("")
                                            setSelectedExpertise("all")
                                            setSelectedIndustry("all")
                                            setAvailableOnly(false)
                                        }}
                                        className="border-slate-200"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Results */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {filteredMentors.length} of {mentorData.length} mentors
                        </p>
                    </div>

                    {/* Mentor Cards */}
                    {filteredMentors.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {filteredMentors.map((mentor) => (
                                <MentorCard key={mentor.id} mentor={mentor}/>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-12 text-center">
                                <User className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No mentors found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search criteria or clearing filters
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedExpertise("all")
                                        setSelectedIndustry("all")
                                        setAvailableOnly(false)
                                    }}
                                    className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                                >
                                    Clear All Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="my-mentorships" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">My Mentorship Relationships</h2>
                        <Button variant="outline"
                                className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                            <Calendar className="h-4 w-4 mr-2"/>
                            Schedule Session
                        </Button>
                    </div>

                    {mentorshipData.length > 0 ? (
                        <div className="grid gap-6 lg:grid-cols-2">
                            {mentorshipData.map((relationship) => (
                                <MentorshipRelationshipCard key={relationship.id} relationship={relationship}/>
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No active mentorships</h3>
                                <p className="text-gray-600 mb-4">
                                    Start your mentorship journey by connecting with an experienced alumni
                                </p>
                                <Button onClick={() => setActiveTab("find-mentor")}
                                        className="bg-green-primary hover:bg-green-600">
                                    <UserPlus className="h-4 w-4 mr-2"/>
                                    Find a Mentor
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="resources" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-6 w-6 text-blue-600"/>
                                    Mentorship Guide
                                </CardTitle>
                                <CardDescription>
                                    Learn how to make the most of your mentorship experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Button variant="outline"
                                        className="w-full border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                    <Download className="h-4 w-4 mr-2"/>
                                    Download Guide
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-6 w-6 text-green-600"/>
                                    Goal Setting Template
                                </CardTitle>
                                <CardDescription>
                                    Set clear objectives for your mentorship journey
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Button variant="outline"
                                        className="w-full border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                                    <Download className="h-4 w-4 mr-2"/>
                                    Get Template
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg border-b">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-6 w-6 text-orange-600"/>
                                    Communication Tips
                                </CardTitle>
                                <CardDescription>
                                    Best practices for effective mentor-mentee communication
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Button variant="outline"
                                        className="w-full border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white">
                                    <Download className="h-4 w-4 mr-2"/>
                                    Read Tips
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}