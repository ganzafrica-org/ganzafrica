"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Briefcase,
    Search,
    Filter,
    MapPin,
    Building,
    Clock,
    DollarSign,
    ExternalLink,
    BookmarkPlus,
    Send,
    Users,
    TrendingUp,
    Calendar,
    Globe,
    Eye,
    Star,
    Plus,
    Download
} from "lucide-react"

// Dummy job data
const jobData = [
    {
        id: 1,
        title: "Senior Software Engineer",
        company: "TechCorp Solutions",
        location: "San Francisco, CA",
        type: "Full-time",
        remote: true,
        salary: "$120,000 - $150,000",
        posted: "2 days ago",
        deadline: "2025-09-15",
        description: "Join our engineering team to build scalable web applications using React, Node.js, and cloud technologies.",
        requirements: ["5+ years experience", "React expertise", "Node.js knowledge", "Cloud platforms (AWS/GCP)"],
        skills: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
        postedBy: "Internal",
        applications: 24,
        views: 156,
        featured: true,
        companyLogo: null,
        industry: "Technology",
        experienceLevel: "Senior"
    },
    {
        id: 2,
        title: "Product Manager",
        company: "StartupXYZ",
        location: "Kigali, Rwanda",
        type: "Full-time",
        remote: false,
        salary: "$80,000 - $100,000",
        posted: "5 days ago",
        deadline: "2025-09-20",
        description: "Lead product strategy and development for our fintech platform serving African markets.",
        requirements: ["3+ years PM experience", "Fintech background", "African market knowledge", "Data-driven approach"],
        skills: ["Product Strategy", "Data Analysis", "Fintech", "User Research"],
        postedBy: "External",
        applications: 18,
        views: 89,
        featured: false,
        companyLogo: null,
        industry: "FinTech",
        experienceLevel: "Mid-level"
    },
    {
        id: 3,
        title: "Data Scientist",
        company: "AI Solutions Inc",
        location: "Remote",
        type: "Full-time",
        remote: true,
        salary: "$90,000 - $120,000",
        posted: "1 week ago",
        deadline: "2025-09-25",
        description: "Develop machine learning models and data pipelines to drive business insights and automation.",
        requirements: ["PhD or Masters in related field", "Python/R proficiency", "ML frameworks", "Statistical analysis"],
        skills: ["Python", "Machine Learning", "Statistics", "SQL", "TensorFlow"],
        postedBy: "External",
        applications: 31,
        views: 203,
        featured: true,
        companyLogo: null,
        industry: "Technology",
        experienceLevel: "Senior"
    },
    {
        id: 4,
        title: "UX/UI Designer",
        company: "Design Studio Pro",
        location: "London, UK",
        type: "Contract",
        remote: true,
        salary: "$60,000 - $80,000",
        posted: "3 days ago",
        deadline: "2025-09-18",
        description: "Create beautiful and intuitive user experiences for mobile and web applications.",
        requirements: ["3+ years UX/UI experience", "Figma proficiency", "User research skills", "Portfolio required"],
        skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
        postedBy: "External",
        applications: 12,
        views: 67,
        featured: false,
        companyLogo: null,
        industry: "Design",
        experienceLevel: "Mid-level"
    },
    {
        id: 5,
        title: "DevOps Engineer",
        company: "CloudTech Solutions",
        location: "Berlin, Germany",
        type: "Full-time",
        remote: true,
        salary: "$85,000 - $110,000",
        posted: "4 days ago",
        deadline: "2025-09-22",
        description: "Build and maintain CI/CD pipelines, infrastructure automation, and cloud deployments.",
        requirements: ["4+ years DevOps experience", "Kubernetes expertise", "Cloud platforms", "Infrastructure as Code"],
        skills: ["Kubernetes", "Docker", "Terraform", "AWS", "Jenkins"],
        postedBy: "External",
        applications: 19,
        views: 134,
        featured: false,
        companyLogo: null,
        industry: "Technology",
        experienceLevel: "Mid-level"
    },
    {
        id: 6,
        title: "Marketing Manager",
        company: "GrowthCo",
        location: "Toronto, Canada",
        type: "Full-time",
        remote: false,
        salary: "$70,000 - $90,000",
        posted: "6 days ago",
        deadline: "2025-09-28",
        description: "Lead digital marketing campaigns and growth strategies for B2B SaaS products.",
        requirements: ["3+ years marketing experience", "B2B SaaS background", "Growth hacking skills", "Analytics expertise"],
        skills: ["Digital Marketing", "Growth Hacking", "Analytics", "Content Marketing"],
        postedBy: "Internal",
        applications: 22,
        views: 98,
        featured: false,
        companyLogo: null,
        industry: "Marketing",
        experienceLevel: "Mid-level"
    },
    {
        id: 7,
        title: "Venture Capital Analyst",
        company: "Future Ventures",
        location: "New York, NY",
        type: "Full-time",
        remote: false,
        salary: "$100,000 - $130,000",
        posted: "1 week ago",
        deadline: "2025-09-30",
        description: "Analyze investment opportunities and support portfolio companies in their growth journey.",
        requirements: ["2+ years finance experience", "Investment analysis skills", "Startup ecosystem knowledge", "MBA preferred"],
        skills: ["Financial Analysis", "Due Diligence", "Startup Evaluation", "Portfolio Management"],
        postedBy: "External",
        applications: 15,
        views: 78,
        featured: true,
        companyLogo: null,
        industry: "Finance",
        experienceLevel: "Junior"
    },
    {
        id: 8,
        title: "Sustainability Consultant",
        company: "EcoConsult Global",
        location: "Nairobi, Kenya",
        type: "Contract",
        remote: true,
        salary: "$65,000 - $85,000",
        posted: "3 days ago",
        deadline: "2025-09-20",
        description: "Help organizations develop and implement sustainable business practices and environmental strategies.",
        requirements: ["Environmental science background", "Consulting experience", "Sustainability expertise", "African market knowledge"],
        skills: ["Sustainability", "Environmental Analysis", "Consulting", "Project Management"],
        postedBy: "External",
        applications: 8,
        views: 45,
        featured: false,
        companyLogo: null,
        industry: "Environmental",
        experienceLevel: "Mid-level"
    }
]

const getDepartmentColor = (industry: string) => {
    switch (industry.toLowerCase()) {
        case 'technology':
            return 'from-emerald-500 to-green-600'
        case 'fintech':
            return 'from-blue-500 to-cyan-600'
        case 'design':
            return 'from-amber-500 to-orange-600'
        case 'marketing':
            return 'from-purple-500 to-indigo-600'
        case 'finance':
            return 'from-pink-500 to-rose-600'
        case 'environmental':
            return 'from-cyan-500 to-teal-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniJobs() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState("all")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedIndustry, setSelectedIndustry] = useState("all")
    const [selectedSource, setSelectedSource] = useState("all")
    const [remoteOnly, setRemoteOnly] = useState(false)
    const [featuredOnly, setFeaturedOnly] = useState(false)

    // Filter jobs based on search and filters
    const filteredJobs = jobData.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesLocation = selectedLocation === "all" || job.location.includes(selectedLocation)
        const matchesType = selectedType === "all" || job.type === selectedType
        const matchesIndustry = selectedIndustry === "all" || job.industry === selectedIndustry
        const matchesSource = selectedSource === "all" || job.postedBy === selectedSource
        const matchesRemote = !remoteOnly || job.remote
        const matchesFeatured = !featuredOnly || job.featured

        return matchesSearch && matchesLocation && matchesType && matchesIndustry && matchesSource && matchesRemote && matchesFeatured
    })

    // Get unique values for filters
    const locations = [...new Set(jobData.map(j => j.location.split(',')[1]?.trim() || j.location))].filter(Boolean).sort()
    const types = [...new Set(jobData.map(j => j.type))].sort()
    const industries = [...new Set(jobData.map(j => j.industry))].sort()

    const JobCard = ({job}: { job: typeof jobData[0] }) => (
        <Card
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200 ${job.featured ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
            {job.featured && (
                <div
                    className="bg-green-primary text-white text-xs font-medium px-3 py-1 rounded-t-lg flex items-center gap-1">
                    <Star className="h-3 w-3"/>
                    Featured
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{job.title}</h3>
                        <p className="text-gray-600 flex items-center gap-1">
                            <Building className="h-4 w-4"/>
                            {job.company}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-orange-500"/>
                                {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-blue-500"/>
                                {job.posted}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <Badge variant={job.postedBy === 'Internal' ? 'default' : 'secondary'}
                               className={job.postedBy === 'Internal' ? 'bg-green-primary' : ''}>
                            {job.postedBy}
                        </Badge>
                        <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(job.industry)} text-white`}>
                            {job.type}
                        </div>
                        {job.remote && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                                Remote
                            </Badge>
                        )}
                    </div>
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-500"/>
                        <span className="text-sm font-medium text-gray-900">{job.salary}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                            </Badge>
                        ))}
                        {job.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                                +{job.skills.length - 4} more
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3"/>
                                {job.views} views
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3"/>
                                {job.applications} applications
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3"/>
                                Deadline: {new Date(job.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-green-primary hover:bg-green-600">
                        <Send className="h-4 w-4 mr-2"/>
                        Apply Now
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <BookmarkPlus className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white">
                        <ExternalLink className="h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Job
                        Opportunities</h1>
                    <p className="text-gray-600">Discover {jobData.length} career opportunities tailored for our
                        alumni</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Filter className="h-4 w-4 mr-2"/>
                        Job Alerts
                    </Button>
                    <Button size="sm" className="bg-green-primary hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2"/>
                        Post a Job
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Jobs</CardTitle>
                        <Briefcase className="h-5 w-5 text-emerald-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{jobData.length}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3"/>
                            +4 this week
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Featured Jobs</CardTitle>
                        <Star className="h-5 w-5 text-blue-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {jobData.filter(j => j.featured).length}
                        </div>
                        <p className="text-xs text-blue-100">Premium opportunities</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Remote Jobs</CardTitle>
                        <Globe className="h-5 w-5 text-amber-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {jobData.filter(j => j.remote).length}
                        </div>
                        <p className="text-xs text-amber-100">Work from anywhere</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Internal Posts</CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {jobData.filter(j => j.postedBy === 'Internal').length}
                        </div>
                        <p className="text-xs text-purple-100">Alumni referrals</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search by job title, company, or skills..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Location"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {locations.map((location) => (
                                        <SelectItem key={location} value={location}>
                                            {location}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Job Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {types.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
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

                            <Select value={selectedSource} onValueChange={setSelectedSource}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Source"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sources</SelectItem>
                                    <SelectItem value="Internal">Internal</SelectItem>
                                    <SelectItem value="External">External</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={remoteOnly ? "default" : "outline"}
                                onClick={() => setRemoteOnly(!remoteOnly)}
                                className={`justify-start ${remoteOnly ? 'bg-blue-secondary hover:bg-blue-600' : 'border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white'}`}
                            >
                                <Globe className="h-4 w-4 mr-2"/>
                                Remote Only
                            </Button>

                            <Button
                                variant={featuredOnly ? "default" : "outline"}
                                onClick={() => setFeaturedOnly(!featuredOnly)}
                                className={`justify-start ${featuredOnly ? 'bg-green-primary hover:bg-green-600' : 'border-green-primary text-green-primary hover:bg-green-primary hover:text-white'}`}
                            >
                                <Star className="h-4 w-4 mr-2"/>
                                Featured Only
                            </Button>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedLocation("all")
                                setSelectedType("all")
                                setSelectedIndustry("all")
                                setSelectedSource("all")
                                setRemoteOnly(false)
                                setFeaturedOnly(false)
                            }}
                            className="w-full md:w-auto border-slate-200"
                        >
                            Clear All Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Showing {filteredJobs.length} of {jobData.length} jobs
                </p>

                <Select defaultValue="newest">
                    <SelectTrigger className="w-48 border-slate-200">
                        <SelectValue placeholder="Sort by"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="salary-high">Salary: High to Low</SelectItem>
                        <SelectItem value="salary-low">Salary: Low to High</SelectItem>
                        <SelectItem value="company">Company A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Job Listings */}
            {filteredJobs.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {filteredJobs.map((job) => (
                        <JobCard key={job.id} job={job}/>
                    ))}
                </div>
            ) : (
                <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or clearing filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedLocation("all")
                                setSelectedType("all")
                                setSelectedIndustry("all")
                                setSelectedSource("all")
                                setRemoteOnly(false)
                                setFeaturedOnly(false)
                            }}
                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Job Alerts CTA */}
            <Card className="bg-gradient-to-r from-green-primary to-green-secondary text-white shadow-lg">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Never Miss an Opportunity</h3>
                            <p className="text-green-100 mb-4">
                                Set up job alerts and get notified when new positions match your criteria
                            </p>
                        </div>
                        <Button variant="secondary" className="hover:shadow-md transition-all duration-300">
                            <Filter className="h-4 w-4 mr-2"/>
                            Create Job Alert
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Popular Skills */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                        <TrendingUp className="h-6 w-6 text-orange-600"/>
                        Trending Skills
                    </CardTitle>
                    <CardDescription>
                        Most in-demand skills across all job postings
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {["React", "Python", "Node.js", "AWS", "Machine Learning", "Product Strategy", "Data Analysis", "Figma", "Kubernetes", "TypeScript", "SQL", "Leadership"].map((skill) => (
                            <Badge
                                key={skill}
                                variant="outline"
                                className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                                onClick={() => setSearchTerm(skill)}
                            >
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}