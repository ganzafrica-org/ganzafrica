"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
    Users,
    Briefcase,
    Calendar,
    Trophy,
    TrendingUp,
    MapPin,
    Building,
    Clock,
    ArrowRight,
    Star,
    UserPlus,
    MessageSquare,
    BookOpen,
    Target,
    Globe,
    Plus,
    Eye
} from "lucide-react"
import Link from "next/link"

// Dummy data
const alumniStats = {
    totalAlumni: 1247,
    activeMembers: 892,
    mentorshipPairs: 156,
    upcomingEvents: 8,
    jobPostings: 24,
    achievements: 89
}

const recentActivities = [
    {
        id: 1,
        type: "mentorship",
        user: "Sarah Johnson",
        avatar: null,
        action: "started mentoring",
        target: "Michael Chen",
        time: "2 hours ago",
        icon: UserPlus
    },
    {
        id: 2,
        type: "job",
        user: "Tech Corp",
        avatar: null,
        action: "posted new job",
        target: "Senior Software Engineer",
        time: "5 hours ago",
        icon: Briefcase
    },
    {
        id: 3,
        type: "achievement",
        user: "David Williams",
        avatar: null,
        action: "earned achievement",
        target: "Innovation Leader",
        time: "1 day ago",
        icon: Trophy
    },
    {
        id: 4,
        type: "event",
        user: "Alumni Association",
        avatar: null,
        action: "scheduled event",
        target: "Tech Career Fair 2025",
        time: "2 days ago",
        icon: Calendar
    }
]

const featuredAlumni = [
    {
        id: 1,
        name: "Emma Rodriguez",
        title: "CEO, InnovateTech",
        location: "San Francisco, CA",
        avatar: null,
        company: "InnovateTech",
        achievement: "Forbes 30 Under 30",
        yearGraduated: 2018,
        willingToMentor: true
    },
    {
        id: 2,
        name: "James Liu",
        title: "Product Manager, Google",
        location: "Mountain View, CA",
        avatar: null,
        company: "Google",
        achievement: "Product Excellence Award",
        yearGraduated: 2017,
        willingToMentor: true
    },
    {
        id: 3,
        name: "Aisha Patel",
        title: "Research Scientist, Microsoft",
        location: "Seattle, WA",
        avatar: null,
        company: "Microsoft",
        achievement: "AI Research Pioneer",
        yearGraduated: 2019,
        willingToMentor: false
    }
]

const upcomingEvents = [
    {
        id: 1,
        title: "Tech Career Fair 2025",
        date: "2025-08-25",
        time: "10:00 AM",
        location: "Virtual Event",
        attendees: 156,
        type: "Career"
    },
    {
        id: 2,
        title: "Alumni Networking Mixer",
        date: "2025-08-30",
        time: "6:00 PM",
        location: "Kigali Convention Center",
        attendees: 89,
        type: "Networking"
    },
    {
        id: 3,
        title: "Entrepreneurship Workshop",
        date: "2025-09-05",
        time: "2:00 PM",
        location: "Innovation Hub",
        attendees: 45,
        type: "Workshop"
    }
]

const jobOpportunities = [
    {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp",
        location: "Remote",
        type: "Full-time",
        salary: "$120,000 - $150,000",
        postedBy: "Internal",
        daysAgo: 2
    },
    {
        id: 2,
        title: "Product Manager",
        company: "StartupXYZ",
        location: "Kigali, Rwanda",
        type: "Full-time",
        salary: "$80,000 - $100,000",
        postedBy: "External",
        daysAgo: 5
    },
    {
        id: 3,
        title: "Data Scientist",
        company: "AI Solutions",
        location: "Nairobi, Kenya",
        type: "Contract",
        salary: "$70,000 - $90,000",
        postedBy: "External",
        daysAgo: 7
    }
]

const getDepartmentColor = (type: string) => {
    switch (type.toLowerCase()) {
        case 'career':
            return 'from-emerald-500 to-green-600'
        case 'networking':
            return 'from-blue-500 to-cyan-600'
        case 'workshop':
            return 'from-amber-500 to-orange-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniDashboard() {
    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-primary to-green-secondary rounded-lg text-white p-8 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-3">Welcome to the Alumni Network</h1>
                        <p className="text-green-100 mb-6 text-lg">
                            Connect, grow, and give back to the GanzAfrica community
                        </p>
                        <div className="flex items-center gap-4">
                            <Button variant="secondary" asChild className="hover:shadow-md transition-all duration-300">
                                <Link href="/alumni/directory">
                                    <Users className="h-4 w-4 mr-2" />
                                    Browse Alumni
                                </Link>
                            </Button>
                            <Button variant="outline" className="border-green-200 text-white hover:bg-green-600 hover:shadow-md transition-all duration-300" asChild>
                                <Link href="/alumni/jobs">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    View Jobs
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-32 h-32 bg-green-500 rounded-full opacity-20"></div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Alumni</CardTitle>
                        <Users className="h-5 w-5 text-emerald-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniStats.totalAlumni.toLocaleString()}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1 mt-1">
                            <TrendingUp className="h-3 w-3" />
                            +45 this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Mentorship Pairs</CardTitle>
                        <UserPlus className="h-5 w-5 text-amber-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniStats.mentorshipPairs}</div>
                        <p className="text-xs text-amber-100">Active connections</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Upcoming Events</CardTitle>
                        <Calendar className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniStats.upcomingEvents}</div>
                        <p className="text-xs text-purple-100">Next 30 days</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-cyan-100">Job Postings</CardTitle>
                        <Briefcase className="h-5 w-5 text-cyan-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniStats.jobPostings}</div>
                        <p className="text-xs text-cyan-100">Open positions</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-100">Achievements</CardTitle>
                        <Trophy className="h-5 w-5 text-yellow-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniStats.achievements}</div>
                        <p className="text-xs text-yellow-100">This year</p>
                    </CardContent>
                </Card>
            </div>
            
            {/* Quick Actions */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                    <CardTitle className="text-xl text-slate-800">Quick Actions</CardTitle>
                    <CardDescription>
                        Get started with the most popular alumni activities
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button variant="outline" className="h-auto p-6 flex flex-col gap-3 border-green-200 hover:bg-green-50 hover:border-green-400 transition-all duration-300" asChild>
                            <Link href="/alumni/mentorship">
                                <UserPlus className="h-8 w-8 text-green-600" />
                                <span className="font-medium">Find a Mentor</span>
                                <span className="text-xs text-gray-500 text-center">Connect with experienced alumni</span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto p-6 flex flex-col gap-3 border-blue-200 hover:bg-blue-50 hover:border-blue-400 transition-all duration-300" asChild>
                            <Link href="/alumni/events">
                                <Calendar className="h-8 w-8 text-blue-600" />
                                <span className="font-medium">Join Events</span>
                                <span className="text-xs text-gray-500 text-center">Network and learn together</span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto p-6 flex flex-col gap-3 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300" asChild>
                            <Link href="/alumni/resources">
                                <BookOpen className="h-8 w-8 text-purple-600" />
                                <span className="font-medium">Access Resources</span>
                                <span className="text-xs text-gray-500 text-center">Tools and guides for success</span>
                            </Link>
                        </Button>

                        <Button variant="outline" className="h-auto p-6 flex flex-col gap-3 border-amber-200 hover:bg-amber-50 hover:border-amber-400 transition-all duration-300" asChild>
                            <Link href="/alumni/achievements">
                                <Trophy className="h-8 w-8 text-amber-600" />
                                <span className="font-medium">Share Success</span>
                                <span className="text-xs text-gray-500 text-center">Celebrate your achievements</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="lg:col-span-2">
                    <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b">
                            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                                <Clock className="h-6 w-6 text-blue-600" />
                                Recent Activities
                            </CardTitle>
                            <CardDescription>
                                Latest updates from the alumni community
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const Icon = activity.icon
                                    return (
                                        <div key={activity.id} className="flex items-start gap-3 p-4 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Icon className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm">
                                                    <span className="font-medium text-gray-900">{activity.user}</span>
                                                    <span className="text-gray-600"> {activity.action} </span>
                                                    <span className="font-medium text-gray-900">{activity.target}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                                <Button variant="outline" className="w-full border-green-primary text-green-primary hover:bg-green-primary hover:text-white" asChild>
                                    <Link href="/alumni/activities">
                                        View All Activities
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Featured Alumni */}
                <div>
                    <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg border-b">
                            <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                                <Star className="h-6 w-6 text-emerald-600" />
                                Featured Alumni
                            </CardTitle>
                            <CardDescription>
                              Celebrating achievements of members
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {featuredAlumni.map((alumni) => (
                                    <div key={alumni.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="w-12 h-12">
                                                {alumni.avatar ? (
                                                    <AvatarImage src={alumni.avatar} alt={alumni.name} />
                                                ) : (
                                                    <AvatarFallback className="bg-green-100 text-green-700">
                                                        {alumni.name.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm text-gray-900">{alumni.name}</h4>
                                                <p className="text-xs text-gray-600">{alumni.title}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <Building className="h-3 w-3" />
                                                    {alumni.company}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-xs">
                                                        Class of {alumni.yearGraduated}
                                                    </Badge>
                                                    {alumni.willingToMentor && (
                                                        <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                                            Mentor
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t">
                                <Button variant="outline" className="w-full border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white" asChild>
                                    <Link href="/alumni/directory">
                                        View All Alumni
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Upcoming Events */}
                <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                            <Calendar className="h-6 w-6 text-purple-600" />
                            Upcoming Events
                        </CardTitle>
                        <CardDescription>
                            Don't miss these exciting alumni events
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {upcomingEvents.map((event) => (
                                <div key={event.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                {event.location}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {event.attendees} attendees registered
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(event.type)} text-white`}>
                                            {event.type}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <Button variant="outline" className="w-full border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white" asChild>
                                <Link href="/alumni/events">
                                    View All Events
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Job Opportunities */}
                <Card className="shadow-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-lg border-b">
                        <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                            <Briefcase className="h-6 w-6 text-cyan-600" />
                            Latest Job Opportunities
                        </CardTitle>
                        <CardDescription>
                            Opportunities tailored for our alumni
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {jobOpportunities.map((job) => (
                                <div key={job.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{job.title}</h4>
                                            <p className="text-sm text-gray-600">{job.company}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.location}
                                                </span>
                                                <span>{job.type}</span>
                                                <span>{job.salary}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Posted {job.daysAgo} days ago
                                            </p>
                                        </div>
                                        <Badge variant={job.postedBy === 'Internal' ? 'default' : 'secondary'} className={job.postedBy === 'Internal' ? 'bg-green-600' : ''}>
                                            {job.postedBy}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <Button variant="outline" className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white" asChild>
                                <Link href="/alumni/jobs">
                                    View All Jobs
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}