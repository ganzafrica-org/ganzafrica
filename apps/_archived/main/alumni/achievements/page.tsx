"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
    Trophy,
    Search,
    Star,
    Award,
    Medal,
    Crown,
    Target,
    TrendingUp,
    Heart,
    Share2,
    Plus,
    Calendar,
    Building,
    MapPin,
    ExternalLink,
    Eye,
    ThumbsUp,
    MessageSquare,
    Filter,
    Zap,
    Briefcase,
    Users,
    Globe,
    Download
} from "lucide-react"

// Dummy achievements data
const achievementsData = [
    {
        id: 1,
        title: "Forbes 30 Under 30",
        description: "Recognized as one of the most influential young entrepreneurs in technology for building innovative AI solutions that impact millions of users worldwide.",
        achiever: "Emma Rodriguez",
        achieverTitle: "CEO & Founder, InnovateTech",
        achieverAvatar: null,
        achieverGradYear: 2018,
        category: "Recognition",
        type: "Award",
        date: "2025-03-15",
        organization: "Forbes Magazine",
        location: "New York, USA",
        featured: true,
        likes: 89,
        comments: 12,
        shares: 24,
        views: 456,
        tags: ["Entrepreneurship", "Technology", "Innovation", "AI"],
        image: null,
        link: "https://forbes.com/30under30",
        verificationStatus: "Verified"
    },
    {
        id: 2,
        title: "Successfully Raised $10M Series A",
        description: "Led the Series A funding round for EcoSolutions, securing investment from top-tier VCs to scale sustainable technology across Africa.",
        achiever: "David Williams",
        achieverTitle: "Founder & CEO, EcoSolutions",
        achieverAvatar: null,
        achieverGradYear: 2020,
        category: "Business Milestone",
        type: "Funding",
        date: "2025-02-28",
        organization: "EcoSolutions",
        location: "Kigali, Rwanda",
        featured: true,
        likes: 67,
        comments: 8,
        shares: 19,
        views: 234,
        tags: ["Funding", "Startup", "Sustainability", "Africa"],
        image: null,
        link: "#",
        verificationStatus: "Verified"
    },
    {
        id: 3,
        title: "AI Research Paper Published in Nature",
        description: "Co-authored groundbreaking research on machine learning applications in climate modeling, published in one of the world's most prestigious scientific journals.",
        achiever: "Aisha Patel",
        achieverTitle: "Research Scientist, Microsoft Research",
        achieverAvatar: null,
        achieverGradYear: 2019,
        category: "Academic",
        type: "Publication",
        date: "2025-01-20",
        organization: "Nature Publishing",
        location: "Seattle, USA",
        featured: false,
        likes: 45,
        comments: 6,
        shares: 11,
        views: 189,
        tags: ["Research", "AI", "Climate", "Publication"],
        image: null,
        link: "https://nature.com/articles/ai-climate",
        verificationStatus: "Verified"
    },
    {
        id: 4,
        title: "Product of the Year Award",
        description: "Led the product team that won Google's internal Product Excellence Award for developing features used by over 100 million users daily.",
        achiever: "James Liu",
        achieverTitle: "Senior Product Manager, Google",
        achieverAvatar: null,
        achieverGradYear: 2017,
        category: "Professional",
        type: "Award",
        date: "2024-12-15",
        organization: "Google Inc.",
        location: "Mountain View, USA",
        featured: false,
        likes: 78,
        comments: 15,
        shares: 22,
        views: 345,
        tags: ["Product Management", "Innovation", "Google", "Scale"],
        image: null,
        link: "#",
        verificationStatus: "Verified"
    },
    {
        id: 5,
        title: "Design Excellence Award",
        description: "Won the prestigious UX Awards for designing the user interface that increased user engagement by 300% and became an industry benchmark.",
        achiever: "Sarah Johnson",
        achieverTitle: "UX Design Lead, Spotify",
        achieverAvatar: null,
        achieverGradYear: 2021,
        category: "Professional",
        type: "Award",
        date: "2024-11-30",
        organization: "UX Awards International",
        location: "Stockholm, Sweden",
        featured: true,
        likes: 56,
        comments: 9,
        shares: 16,
        views: 267,
        tags: ["Design", "UX", "Innovation", "Spotify"],
        image: null,
        link: "https://uxawards.com/winners",
        verificationStatus: "Verified"
    },
    {
        id: 6,
        title: "African Tech Investor of the Year",
        description: "Recognized for outstanding contributions to the African tech ecosystem through strategic investments in 15+ startups, with 80% success rate.",
        achiever: "Robert Nkomo",
        achieverTitle: "VC Associate, Accel Partners",
        achieverAvatar: null,
        achieverGradYear: 2019,
        category: "Recognition",
        type: "Award",
        date: "2024-10-25",
        organization: "African Tech Awards",
        location: "Lagos, Nigeria",
        featured: false,
        likes: 41,
        comments: 7,
        shares: 13,
        views: 178,
        tags: ["Investment", "Africa", "VC", "Startups"],
        image: null,
        link: "#",
        verificationStatus: "Verified"
    },
    {
        id: 7,
        title: "Hackathon Winner - Netflix Prize",
        description: "Won the grand prize at Netflix's internal hackathon for developing an ML algorithm that improved content recommendation accuracy by 25%.",
        achiever: "Fatima Al-Zahra",
        achieverTitle: "Data Scientist, Netflix",
        achieverAvatar: null,
        achieverGradYear: 2020,
        category: "Competition",
        type: "Competition Win",
        date: "2024-09-18",
        organization: "Netflix Inc.",
        location: "Los Angeles, USA",
        featured: false,
        likes: 33,
        comments: 4,
        shares: 8,
        views: 134,
        tags: ["Hackathon", "Machine Learning", "Netflix", "Innovation"],
        image: null,
        link: "#",
        verificationStatus: "Verified"
    },
    {
        id: 8,
        title: "Open Source Contributor Award",
        description: "Recognized as a top contributor to React ecosystem with over 1000 GitHub stars and contributions used by millions of developers worldwide.",
        achiever: "Michael Chen",
        achieverTitle: "Software Engineer, Stripe",
        achieverAvatar: null,
        achieverGradYear: 2022,
        category: "Community",
        type: "Recognition",
        date: "2024-08-12",
        organization: "GitHub",
        location: "Dublin, Ireland",
        featured: false,
        likes: 29,
        comments: 5,
        shares: 7,
        views: 98,
        tags: ["Open Source", "React", "GitHub", "Community"],
        image: null,
        link: "https://github.com/michaelchen",
        verificationStatus: "Verified"
    }
]

// Achievement categories for organization
const achievementCategories = [
    {
        name: "Recognition",
        icon: Crown,
        description: "Awards and recognitions",
        count: achievementsData.filter(a => a.category === "Recognition").length,
        color: "text-yellow-600"
    },
    {
        name: "Professional",
        icon: Briefcase,
        description: "Career achievements",
        count: achievementsData.filter(a => a.category === "Professional").length,
        color: "text-blue-600"
    },
    {
        name: "Business Milestone",
        icon: TrendingUp,
        description: "Business and startup wins",
        count: achievementsData.filter(a => a.category === "Business Milestone").length,
        color: "text-green-600"
    },
    {
        name: "Academic",
        icon: Award,
        description: "Research and academic honors",
        count: achievementsData.filter(a => a.category === "Academic").length,
        color: "text-purple-600"
    },
    {
        name: "Competition",
        icon: Medal,
        description: "Hackathons and competitions",
        count: achievementsData.filter(a => a.category === "Competition").length,
        color: "text-red-600"
    },
    {
        name: "Community",
        icon: Users,
        description: "Community contributions",
        count: achievementsData.filter(a => a.category === "Community").length,
        color: "text-indigo-600"
    }
]

const getDepartmentColor = (category: string) => {
    switch (category.toLowerCase()) {
        case 'recognition':
            return 'from-yellow-500 to-orange-600'
        case 'professional':
            return 'from-blue-500 to-cyan-600'
        case 'business milestone':
            return 'from-emerald-500 to-green-600'
        case 'academic':
            return 'from-purple-500 to-indigo-600'
        case 'competition':
            return 'from-red-500 to-pink-600'
        case 'community':
            return 'from-indigo-500 to-purple-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniAchievements() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedYear, setSelectedYear] = useState("all")
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [showSubmissionForm, setShowSubmissionForm] = useState(false)

    // Filter achievements based on search and filters
    const filteredAchievements = achievementsData.filter(achievement => {
        const matchesSearch = achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            achievement.achiever.toLowerCase().includes(searchTerm.toLowerCase()) ||
            achievement.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = selectedCategory === "all" || achievement.category === selectedCategory
        const matchesType = selectedType === "all" || achievement.type === selectedType
        const matchesYear = selectedYear === "all" || new Date(achievement.date).getFullYear().toString() === selectedYear
        const matchesFeatured = !featuredOnly || achievement.featured

        return matchesSearch && matchesCategory && matchesType && matchesYear && matchesFeatured
    })

    // Get unique values for filters
    const achievementTypes = [...new Set(achievementsData.map(a => a.type))].sort()
    const years = [...new Set(achievementsData.map(a => new Date(a.date).getFullYear().toString()))].sort((a, b) => b.localeCompare(a))
    const categories = [...new Set(achievementsData.map(a => a.category))].sort()

    const AchievementCard = ({achievement}: { achievement: typeof achievementsData[0] }) => (
        <Card
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200 ${achievement.featured ? 'ring-2 ring-yellow-200 bg-yellow-50/30' : ''}`}>
            {achievement.featured && (
                <div
                    className="bg-yellow-500 text-white text-xs font-medium px-3 py-1 rounded-t-lg flex items-center gap-1">
                    <Star className="h-3 w-3"/>
                    Featured Achievement
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                        {achievement.achieverAvatar ? (
                            <AvatarImage src={achievement.achieverAvatar} alt={achievement.achiever}/>
                        ) : (
                            <AvatarFallback
                                className={`bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white font-semibold`}>
                                {achievement.achiever.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">{achievement.title}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <span className="font-medium">{achievement.achiever}</span>
                                    <span>•</span>
                                    <span>{achievement.achieverTitle}</span>
                                    <span>•</span>
                                    <span>Class of {achievement.achieverGradYear}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 items-end">
                                <div
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white`}>
                                    {achievement.category}
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {achievement.type}
                                </Badge>
                                {achievement.verificationStatus === "Verified" && (
                                    <Badge variant="outline" className="text-green-600 border-green-200">
                                        <Zap className="h-3 w-3 mr-1"/>
                                        Verified
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">{achievement.description}</p>

                        <div className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Building className="h-4 w-4 text-orange-500"/>
                                    {achievement.organization}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-blue-500"/>
                                    {achievement.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-emerald-500"/>
                                    {new Date(achievement.date).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {achievement.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Eye className="h-4 w-4"/>
                                        {achievement.views}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4"/>
                                        {achievement.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4"/>
                                        {achievement.comments}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm"
                                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                                        <Heart className="h-4 w-4 mr-1"/>
                                        {achievement.likes}
                                    </Button>
                                    <Button variant="outline" size="sm"
                                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                                        <Share2 className="h-4 w-4"/>
                                    </Button>
                                    {achievement.link && (
                                        <Button variant="outline" size="sm"
                                                className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
                                                asChild>
                                            <a href={achievement.link} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4"/>
                                            </a>
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

    const CategoryCard = ({category}: { category: typeof achievementCategories[0] }) => {
        const Icon = category.icon
        return (
            <Card className="hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200"
                  onClick={() => setSelectedCategory(category.name)}>
                <CardContent className="p-6 text-center">
                    <Icon className={`h-12 w-12 ${category.color} mx-auto mb-3`}/>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <Badge variant="outline">{category.count} achievements</Badge>
                </CardContent>
            </Card>
        )
    }

    const SubmissionForm = () => (
        <Card className="shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
                <CardTitle className="text-xl text-slate-800">Share Your Achievement</CardTitle>
                <CardDescription>
                    Let the community celebrate your success! Share your recent achievement with fellow alumni.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Achievement Title</label>
                        <Input placeholder="e.g., Promoted to Senior Engineer" className="border-slate-200"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select>
                            <SelectTrigger className="border-slate-200">
                                <SelectValue placeholder="Select category"/>
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        placeholder="Tell us about your achievement, what it means to you, and any advice for fellow alumni..."
                        rows={4}
                        className="border-slate-200"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>
                        <Input placeholder="Company or organization name" className="border-slate-200"/>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" className="border-slate-200"/>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Link (optional)</label>
                    <Input placeholder="Link to news article, press release, etc." className="border-slate-200"/>
                </div>

                <div className="flex gap-2 pt-4">
                    <Button className="bg-green-primary hover:bg-green-600">Submit Achievement</Button>
                    <Button variant="outline" onClick={() => setShowSubmissionForm(false)} className="border-slate-200">
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const featuredAchievements = achievementsData.filter(a => a.featured).slice(0, 3)
    const recentAchievements = achievementsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Alumni
                        Achievements</h1>
                    <p className="text-gray-600">Celebrate {achievementsData.length} amazing accomplishments from our
                        community</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Filter className="h-4 w-4 mr-2"/>
                        My Achievements
                    </Button>
                    <Button size="sm" onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                            className="bg-green-primary hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2"/>
                        Share Achievement
                    </Button>
                </div>
            </div>

            {/* Submission Form */}
            {showSubmissionForm && <SubmissionForm/>}

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Achievements</CardTitle>
                        <Trophy className="h-5 w-5 text-emerald-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{achievementsData.length}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3"/>
                            +5 this month
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Featured</CardTitle>
                        <Star className="h-5 w-5 text-blue-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {achievementsData.filter(a => a.featured).length}
                        </div>
                        <p className="text-xs text-blue-100">Outstanding stories</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Verified</CardTitle>
                        <Zap className="h-5 w-5 text-amber-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {achievementsData.filter(a => a.verificationStatus === "Verified").length}
                        </div>
                        <p className="text-xs text-amber-100">Authenticated wins</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Categories</CardTitle>
                        <Globe className="h-5 w-5 text-purple-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <p className="text-xs text-purple-100">Different areas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Featured Achievements */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Achievements</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {featuredAchievements.map((achievement) => (
                        <Card key={achievement.id}
                              className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="h-5 w-5 text-yellow-600"/>
                                    <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                                        Featured
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                                <p className="text-sm text-gray-700 mb-3">{achievement.achiever}</p>
                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>{new Date(achievement.date).toLocaleDateString()}</span>
                                    <span>{achievement.likes} likes</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Browse by Category */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {achievementCategories.map((category) => (
                        <CategoryCard key={category.name} category={category}/>
                    ))}
                </div>
            </div>

            {/* Search and Filters */}
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search achievements by title, achiever, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Category"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {achievementTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Year"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant={featuredOnly ? "default" : "outline"}
                                onClick={() => setFeaturedOnly(!featuredOnly)}
                                className={`justify-start ${featuredOnly ? 'bg-green-primary hover:bg-green-600' : 'border-green-primary text-green-primary hover:bg-green-primary hover:text-white'}`}
                            >
                                <Star className="h-4 w-4 mr-2"/>
                                Featured Only
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedCategory("all")
                                    setSelectedType("all")
                                    setSelectedYear("all")
                                    setFeaturedOnly(false)
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
                    Showing {filteredAchievements.length} of {achievementsData.length} achievements
                </p>

                <Select defaultValue="date">
                    <SelectTrigger className="w-48 border-slate-200">
                        <SelectValue placeholder="Sort by"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Newest First</SelectItem>
                        <SelectItem value="date-asc">Oldest First</SelectItem>
                        <SelectItem value="likes">Most Liked</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Achievement Cards */}
            {filteredAchievements.length > 0 ? (
                <div className="space-y-6">
                    {filteredAchievements.map((achievement) => (
                        <AchievementCard key={achievement.id} achievement={achievement}/>
                    ))}
                </div>
            ) : (
                <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No achievements found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or clearing filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedCategory("all")
                                setSelectedType("all")
                                setSelectedYear("all")
                                setFeaturedOnly(false)
                            }}
                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Recent Achievements Sidebar */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                        <TrendingUp className="h-6 w-6 text-purple-600"/>
                        Recent Achievements
                    </CardTitle>
                    <CardDescription>
                        Latest accomplishments from our community
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {recentAchievements.map((achievement) => (
                            <div key={achievement.id}
                                 className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-slate-100">
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback
                                        className={`bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white text-xs font-semibold`}>
                                        {achievement.achiever.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{achievement.title}</h4>
                                    <p className="text-xs text-gray-600">{achievement.achiever}</p>
                                    <p className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Heart className="h-3 w-3"/>
                                    {achievement.likes}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}