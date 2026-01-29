"use client"

import { useState } from "react"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Users,
    Search,
    Filter,
    MapPin,
    Building,
    Mail,
    Linkedin,
    Github,
    Globe,
    UserPlus,
    MessageSquare,
    Briefcase,
    Download,
    TrendingUp,
} from "lucide-react"

// Dummy data
const alumniData = [
    {
        id: 1,
        name: "Emma Rodriguez",
        title: "CEO & Founder",
        company: "InnovateTech Solutions",
        location: "San Francisco, CA",
        country: "United States",
        avatar: null,
        email: "emma.rodriguez@email.com",
        linkedin: "emma-rodriguez",
        website: "https://emmarodriguez.com",
        graduationYear: 2018,
        program: "Software Engineering Fellowship",
        skills: ["Leadership", "Product Strategy", "Fundraising", "Team Building"],
        achievements: ["Forbes 30 Under 30", "TechCrunch Disrupt Winner"],
        willingToMentor: true,
        industry: "Technology",
        experienceLevel: "Senior",
        bio: "Passionate entrepreneur building the future of AI-powered business solutions."
    },
    {
        id: 2,
        name: "James Liu",
        title: "Senior Product Manager",
        company: "Google",
        location: "Mountain View, CA",
        country: "United States",
        avatar: null,
        email: "james.liu@email.com",
        linkedin: "james-liu-pm",
        github: "jamesliu",
        graduationYear: 2017,
        program: "Product Management Fellowship",
        skills: ["Product Strategy", "Data Analysis", "User Research", "Agile"],
        achievements: ["Product Excellence Award", "Google Innovation Prize"],
        willingToMentor: true,
        industry: "Technology",
        experienceLevel: "Senior",
        bio: "Building products that impact billions of users worldwide."
    },
    {
        id: 3,
        name: "Aisha Patel",
        title: "Research Scientist",
        company: "Microsoft Research",
        location: "Seattle, WA",
        country: "United States",
        avatar: null,
        email: "aisha.patel@email.com",
        linkedin: "aisha-patel-research",
        graduationYear: 2019,
        program: "AI Research Fellowship",
        skills: ["Machine Learning", "Deep Learning", "Research", "Python"],
        achievements: ["AI Research Pioneer Award", "Published 15+ Papers"],
        willingToMentor: false,
        industry: "Research",
        experienceLevel: "Senior",
        bio: "Advancing the frontiers of artificial intelligence and machine learning."
    },
    {
        id: 4,
        name: "David Williams",
        title: "Startup Founder",
        company: "EcoSolutions",
        location: "Kigali, Rwanda",
        country: "Rwanda",
        avatar: null,
        email: "david.williams@email.com",
        linkedin: "david-williams-eco",
        website: "https://ecosolutions.rw",
        graduationYear: 2020,
        program: "Entrepreneurship Fellowship",
        skills: ["Sustainability", "Business Development", "Green Technology", "Leadership"],
        achievements: ["Rwanda Innovation Award", "UN Environmental Recognition"],
        willingToMentor: true,
        industry: "Environmental",
        experienceLevel: "Mid-level",
        bio: "Creating sustainable solutions for a better tomorrow in Africa."
    },
    {
        id: 5,
        name: "Sarah Johnson",
        title: "UX Design Lead",
        company: "Spotify",
        location: "Stockholm, Sweden",
        country: "Sweden",
        avatar: null,
        email: "sarah.johnson@email.com",
        linkedin: "sarah-johnson-ux",
        graduationYear: 2021,
        program: "Design Fellowship",
        skills: ["UX Design", "User Research", "Prototyping", "Design Systems"],
        achievements: ["Design Excellence Award", "UX Awards Winner"],
        willingToMentor: true,
        industry: "Technology",
        experienceLevel: "Mid-level",
        bio: "Crafting delightful user experiences that millions love."
    },
    {
        id: 6,
        name: "Michael Chen",
        title: "Software Engineer",
        company: "Stripe",
        location: "Dublin, Ireland",
        country: "Ireland",
        avatar: null,
        email: "michael.chen@email.com",
        linkedin: "michael-chen-dev",
        github: "michaelchen",
        graduationYear: 2022,
        program: "Software Engineering Fellowship",
        skills: ["Full Stack Development", "React", "Node.js", "Cloud Architecture"],
        achievements: ["Hackathon Winner", "Open Source Contributor"],
        willingToMentor: false,
        industry: "FinTech",
        experienceLevel: "Junior",
        bio: "Building scalable financial infrastructure for the internet economy."
    },
    {
        id: 7,
        name: "Fatima Al-Zahra",
        title: "Data Scientist",
        company: "Netflix",
        location: "Los Angeles, CA",
        country: "United States",
        avatar: null,
        email: "fatima.alzahra@email.com",
        linkedin: "fatima-alzahra-data",
        graduationYear: 2020,
        program: "Data Science Fellowship",
        skills: ["Machine Learning", "Statistics", "Python", "SQL"],
        achievements: ["Data Science Excellence", "Netflix Innovation Award"],
        willingToMentor: true,
        industry: "Entertainment",
        experienceLevel: "Mid-level",
        bio: "Using data to personalize entertainment experiences for millions."
    },
    {
        id: 8,
        name: "Robert Nkomo",
        title: "Venture Capital Associate",
        company: "Accel Partners",
        location: "London, UK",
        country: "United Kingdom",
        avatar: null,
        email: "robert.nkomo@email.com",
        linkedin: "robert-nkomo-vc",
        graduationYear: 2019,
        program: "Finance Fellowship",
        skills: ["Investment Analysis", "Due Diligence", "Portfolio Management", "Networking"],
        achievements: ["Rising Star in VC", "African Tech Investor Award"],
        willingToMentor: true,
        industry: "Finance",
        experienceLevel: "Mid-level",
        bio: "Investing in the next generation of African tech startups."
    }
]

const getDepartmentColor = (industry: string) => {
    switch (industry.toLowerCase()) {
        case 'technology':
            return 'from-emerald-500 to-green-600'
        case 'environmental':
            return 'from-blue-500 to-cyan-600'
        case 'finance':
            return 'from-amber-500 to-orange-600'
        case 'research':
            return 'from-purple-500 to-indigo-600'
        case 'entertainment':
            return 'from-pink-500 to-rose-600'
        case 'fintech':
            return 'from-cyan-500 to-blue-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniDirectory() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCountry, setSelectedCountry] = useState("all")
    const [selectedIndustry, setSelectedIndustry] = useState("all")
    const [selectedYear, setSelectedYear] = useState("all")
    const [mentorsOnly, setMentorsOnly] = useState(false)
    const [viewMode, setViewMode] = useState("grid")

    // Filter alumni based on search and filters
    const filteredAlumni = alumniData.filter(alumni => {
        const matchesSearch = alumni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumni.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumni.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alumni.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCountry = selectedCountry === "all" || alumni.country === selectedCountry
        const matchesIndustry = selectedIndustry === "all" || alumni.industry === selectedIndustry
        const matchesYear = selectedYear === "all" || alumni.graduationYear.toString() === selectedYear
        const matchesMentor = !mentorsOnly || alumni.willingToMentor

        return matchesSearch && matchesCountry && matchesIndustry && matchesYear && matchesMentor
    })

    // Get unique values for filters
    const countries = [...new Set(alumniData.map(a => a.country))].sort()
    const industries = [...new Set(alumniData.map(a => a.industry))].sort()
    const graduationYears = [...new Set(alumniData.map(a => a.graduationYear))].sort((a, b) => b - a)

    const AlumniCard = ({ alumni }: { alumni: typeof alumniData[0] }) => (
        <Card className="hover:shadow-me transition-all duration-300 cursor-pointer hover:-translate-y-1">
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                        {alumni.avatar ? (
                            <AvatarImage src={alumni.avatar} alt={alumni.name} />
                        ) : (
                            <AvatarFallback className={`bg-gradient-to-br ${getDepartmentColor(alumni.industry)} text-white text-lg font-semibold`}>
                                {alumni.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{alumni.name}</h3>
                                <p className="text-gray-600">{alumni.title}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Building className="h-4 w-4" />
                                    {alumni.company}
                                </p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {alumni.location}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                {alumni.willingToMentor && (
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        <UserPlus className="h-3 w-3 mr-1" />
                                        Mentor
                                    </Badge>
                                )}
                                <Badge variant="secondary" className="text-xs">
                                    Class of {alumni.graduationYear}
                                </Badge>
                            </div>
                        </div>

                        <p className="text-sm text-gray-700 mt-3 line-clamp-2">{alumni.bio}</p>

                        <div className="flex flex-wrap gap-1 mt-3">
                            {alumni.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="outline" className="text-xs">
                                    {skill}
                                </Badge>
                            ))}
                            {alumni.skills.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{alumni.skills.length - 3} more
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2">
                                {alumni.linkedin && (
                                    <Button size="sm" variant="ghost" className="p-2">
                                        <Linkedin className="h-4 w-4" />
                                    </Button>
                                )}
                                {alumni.github && (
                                    <Button size="sm" variant="ghost" className="p-2">
                                        <Github className="h-4 w-4" />
                                    </Button>
                                )}
                                {alumni.website && (
                                    <Button size="sm" variant="ghost" className="p-2">
                                        <Globe className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button size="sm" variant="ghost" className="p-2">
                                    <Mail className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Connect
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    const AlumniListItem = ({ alumni }: { alumni: typeof alumniData[0] }) => (
        <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                        {alumni.avatar ? (
                            <AvatarImage src={alumni.avatar} alt={alumni.name} />
                        ) : (
                            <AvatarFallback className={`bg-gradient-to-br ${getDepartmentColor(alumni.industry)} text-white`}>
                                {alumni.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">{alumni.name}</h3>
                                <p className="text-sm text-gray-600">{alumni.title} at {alumni.company}</p>
                                <p className="text-xs text-gray-500">{alumni.location}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                    {alumni.graduationYear}
                                </Badge>
                                {alumni.willingToMentor && (
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        Mentor
                                    </Badge>
                                )}
                                <div className="flex gap-1 ml-4">
                                    <Button size="sm" variant="outline" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                        Connect
                                    </Button>
                                    {alumni.willingToMentor && (
                                        <Button size="sm" className="bg-green-primary hover:bg-green-600">
                                            Request Mentorship
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
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
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Alumni Directory</h1>
                    <p className="text-gray-600">Connect with {alumniData.length} amazing alumni from our community</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Alumni</CardTitle>
                        <Users className="h-5 w-5 text-emerald-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{alumniData.length}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +12 this month
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Available Mentors</CardTitle>
                        <UserPlus className="h-5 w-5 text-blue-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {alumniData.filter(a => a.willingToMentor).length}
                        </div>
                        <p className="text-xs text-blue-100">Ready to help</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Countries</CardTitle>
                        <Globe className="h-5 w-5 text-amber-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{countries.length}</div>
                        <p className="text-xs text-amber-100">Global presence</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Industries</CardTitle>
                        <Briefcase className="h-5 w-5 text-purple-200" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{industries.length}</div>
                        <p className="text-xs text-purple-100">Diverse sectors</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, company, title, or skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Countries</SelectItem>
                                    {countries.map((country) => (
                                        <SelectItem key={country} value={country}>
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Industry" />
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

                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Graduation Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {graduationYears.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>
                                            Class of {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant={mentorsOnly ? "default" : "outline"}
                                onClick={() => setMentorsOnly(!mentorsOnly)}
                                className={`justify-start ${mentorsOnly ? 'bg-green-primary hover:bg-green-600' : 'border-green-primary text-green-primary hover:bg-green-primary hover:text-white'}`}
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Mentors Only
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedCountry("all")
                                    setSelectedIndustry("all")
                                    setSelectedYear("all")
                                    setMentorsOnly(false)
                                }}
                                className="border-slate-200"
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results and View Toggle */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing {filteredAlumni.length} of {alumniData.length} alumni
                </p>

                <Tabs value={viewMode} onValueChange={setViewMode}>
                    <TabsList className="bg-white shadow-sm border">
                        <TabsTrigger value="grid" className="data-[state=active]:bg-green-primary data-[state=active]:text-white flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Grid
                        </TabsTrigger>
                        <TabsTrigger value="list" className="data-[state=active]:bg-blue-secondary data-[state=active]:text-white flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            List
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Alumni Results */}
            <Tabs value={viewMode} onValueChange={setViewMode}>
                <TabsContent value="grid" className="space-y-6">
                    {filteredAlumni.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAlumni.map((alumni) => (
                                <AlumniCard key={alumni.id} alumni={alumni} />
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No alumni found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search criteria or clearing filters
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedCountry("all")
                                        setSelectedIndustry("all")
                                        setSelectedYear("all")
                                        setMentorsOnly(false)
                                    }}
                                    className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                                >
                                    Clear All Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="list" className="space-y-4">
                    {filteredAlumni.length > 0 ? (
                        <div className="space-y-4">
                            {filteredAlumni.map((alumni) => (
                                <AlumniListItem key={alumni.id} alumni={alumni} />
                            ))}
                        </div>
                    ) : (
                        <Card className="shadow-sm">
                            <CardContent className="p-12 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No alumni found</h3>
                                <p className="text-gray-600 mb-4">
                                    Try adjusting your search criteria or clearing filters
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm("")
                                        setSelectedCountry("all")
                                        setSelectedIndustry("all")
                                        setSelectedYear("all")
                                        setMentorsOnly(false)
                                    }}
                                    className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                                >
                                    Clear All Filters
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}