"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BookOpen,
    Search,
    Download,
    ExternalLink,
    Eye,
    Heart,
    Star,
    FileText,
    Video,
    Link,
    PieChart,
    Calculator,
    Users,
    Target,
    TrendingUp,
    Award,
    Lightbulb,
    Share2,
    Plus,
    Filter
} from "lucide-react"

// Dummy resources data
const resourcesData = [
    {
        id: 1,
        title: "Complete Guide to Career Transition",
        description: "Comprehensive guide covering how to successfully transition between industries, negotiate salaries, and build new skills.",
        type: "Guide",
        category: "Career Development",
        format: "PDF",
        size: "2.4 MB",
        pages: 45,
        author: "Emma Rodriguez",
        authorTitle: "CEO, InnovateTech",
        downloads: 234,
        views: 567,
        rating: 4.8,
        reviews: 23,
        tags: ["Career", "Transition", "Salary", "Skills"],
        featured: true,
        dateAdded: "2025-07-15",
        level: "Intermediate",
        estimatedTime: "2 hours",
        url: "#"
    },
    {
        id: 2,
        title: "Startup Funding Masterclass",
        description: "Learn about different funding stages, how to pitch to investors, and what VCs look for in potential investments.",
        type: "Video Course",
        category: "Entrepreneurship",
        format: "Video",
        duration: "3.5 hours",
        author: "David Williams",
        authorTitle: "Founder, EcoSolutions",
        downloads: 189,
        views: 445,
        rating: 4.9,
        reviews: 31,
        tags: ["Startup", "Funding", "Investment", "Pitch"],
        featured: true,
        dateAdded: "2025-07-10",
        level: "Advanced",
        estimatedTime: "3.5 hours",
        url: "#"
    },
    {
        id: 3,
        title: "Product Management Framework",
        description: "A proven framework for product discovery, prioritization, and execution used by top tech companies.",
        type: "Template",
        category: "Product Management",
        format: "Excel/PDF",
        size: "1.8 MB",
        author: "James Liu",
        authorTitle: "Senior PM, Google",
        downloads: 156,
        views: 289,
        rating: 4.7,
        reviews: 18,
        tags: ["Product", "Framework", "Prioritization", "Strategy"],
        featured: false,
        dateAdded: "2025-07-05",
        level: "Intermediate",
        estimatedTime: "1 hour",
        url: "#"
    },
    {
        id: 4,
        title: "Data Science Cheat Sheet Collection",
        description: "Essential formulas, algorithms, and best practices for data science and machine learning projects.",
        type: "Cheat Sheet",
        category: "Data Science",
        format: "PDF",
        size: "5.2 MB",
        pages: 24,
        author: "Fatima Al-Zahra",
        authorTitle: "Data Scientist, Netflix",
        downloads: 298,
        views: 612,
        rating: 4.8,
        reviews: 42,
        tags: ["Data Science", "ML", "Algorithms", "Statistics"],
        featured: false,
        dateAdded: "2025-06-28",
        level: "Advanced",
        estimatedTime: "30 minutes",
        url: "#"
    },
    {
        id: 5,
        title: "UX Design Portfolio Template",
        description: "Professional portfolio template with case study structures, presentation tips, and design best practices.",
        type: "Template",
        category: "Design",
        format: "Figma/PDF",
        size: "12.3 MB",
        author: "Sarah Johnson",
        authorTitle: "UX Lead, Spotify",
        downloads: 145,
        views: 278,
        rating: 4.9,
        reviews: 25,
        tags: ["UX", "Portfolio", "Design", "Template"],
        featured: true,
        dateAdded: "2025-06-20",
        level: "Beginner",
        estimatedTime: "2 hours",
        url: "#"
    },
    {
        id: 6,
        title: "Financial Planning Calculator",
        description: "Interactive spreadsheet for personal financial planning, investment tracking, and retirement calculations.",
        type: "Tool",
        category: "Finance",
        format: "Excel",
        size: "856 KB",
        author: "Robert Nkomo",
        authorTitle: "VC Associate, Accel",
        downloads: 89,
        views: 156,
        rating: 4.6,
        reviews: 12,
        tags: ["Finance", "Planning", "Investment", "Calculator"],
        featured: false,
        dateAdded: "2025-06-15",
        level: "Intermediate",
        estimatedTime: "1.5 hours",
        url: "#"
    },
    {
        id: 7,
        title: "Remote Work Best Practices",
        description: "Essential guide for thriving in remote work environments, productivity tips, and team collaboration strategies.",
        type: "Guide",
        category: "Professional Development",
        format: "PDF",
        size: "1.9 MB",
        pages: 28,
        author: "Michael Chen",
        authorTitle: "Software Engineer, Stripe",
        downloads: 203,
        views: 398,
        rating: 4.7,
        reviews: 19,
        tags: ["Remote Work", "Productivity", "Collaboration", "Tips"],
        featured: false,
        dateAdded: "2025-06-10",
        level: "Beginner",
        estimatedTime: "1 hour",
        url: "#"
    },
    {
        id: 8,
        title: "Networking Strategy Playbook",
        description: "Proven strategies for building meaningful professional relationships, both online and offline.",
        type: "Guide",
        category: "Networking",
        format: "PDF",
        size: "3.1 MB",
        pages: 38,
        author: "Aisha Patel",
        authorTitle: "Research Scientist, Microsoft",
        downloads: 167,
        views: 334,
        rating: 4.8,
        reviews: 28,
        tags: ["Networking", "Relationships", "Professional", "Strategy"],
        featured: false,
        dateAdded: "2025-06-05",
        level: "Intermediate",
        estimatedTime: "1.5 hours",
        url: "#"
    }
]

// Resource categories for organization
const resourceCategories = [
    {
        name: "Career Development",
        icon: TrendingUp,
        description: "Resources to advance your career",
        count: resourcesData.filter(r => r.category === "Career Development").length
    },
    {
        name: "Entrepreneurship",
        icon: Lightbulb,
        description: "Starting and scaling businesses",
        count: resourcesData.filter(r => r.category === "Entrepreneurship").length
    },
    {
        name: "Product Management",
        icon: Target,
        description: "Product strategy and execution",
        count: resourcesData.filter(r => r.category === "Product Management").length
    },
    {
        name: "Data Science",
        icon: PieChart,
        description: "Analytics and machine learning",
        count: resourcesData.filter(r => r.category === "Data Science").length
    },
    {
        name: "Design",
        icon: Award,
        description: "UX/UI and design principles",
        count: resourcesData.filter(r => r.category === "Design").length
    },
    {
        name: "Finance",
        icon: Calculator,
        description: "Financial planning and investment",
        count: resourcesData.filter(r => r.category === "Finance").length
    }
]

const getDepartmentColor = (category: string) => {
    switch (category.toLowerCase()) {
        case 'career development':
            return 'from-emerald-500 to-green-600'
        case 'entrepreneurship':
            return 'from-blue-500 to-cyan-600'
        case 'product management':
            return 'from-amber-500 to-orange-600'
        case 'data science':
            return 'from-purple-500 to-indigo-600'
        case 'design':
            return 'from-pink-500 to-rose-600'
        case 'finance':
            return 'from-cyan-500 to-teal-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniResources() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedLevel, setSelectedLevel] = useState("all")
    const [featuredOnly, setFeaturedOnly] = useState(false)

    // Filter resources based on search and filters
    const filteredResources = resourcesData.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesCategory = selectedCategory === "all" || resource.category === selectedCategory
        const matchesType = selectedType === "all" || resource.type === selectedType
        const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel
        const matchesFeatured = !featuredOnly || resource.featured

        return matchesSearch && matchesCategory && matchesType && matchesLevel && matchesFeatured
    })

    // Get unique values for filters
    const resourceTypes = [...new Set(resourcesData.map(r => r.type))].sort()
    const levels = [...new Set(resourcesData.map(r => r.level))].sort()
    const categories = [...new Set(resourcesData.map(r => r.category))].sort()

    const ResourceCard = ({resource}: { resource: typeof resourcesData[0] }) => (
        <Card
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200 ${resource.featured ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
            {resource.featured && (
                <div
                    className="bg-green-primary text-white text-xs font-medium px-3 py-1 rounded-t-lg flex items-center gap-1">
                    <Star className="h-3 w-3"/>
                    Featured Resource
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{resource.title}</h3>
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{resource.description}</p>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium">By {resource.author}</span>
                            <span>•</span>
                            <span>{resource.authorTitle}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4"/>
                                {resource.views} views
                            </span>
                            <span className="flex items-center gap-1">
                                <Download className="h-4 w-4"/>
                                {resource.downloads} downloads
                            </span>
                            <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                {resource.rating} ({resource.reviews})
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(resource.category)} text-white`}>
                            {resource.type}
                        </div>
                        <Badge variant="secondary">
                            {resource.level}
                        </Badge>
                        <span className="text-xs text-gray-500">{resource.estimatedTime}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Format: {resource.format}</span>
                        <span>
                            {resource.size && `Size: ${resource.size}`}
                            {resource.pages && ` • ${resource.pages} pages`}
                            {resource.duration && `Duration: ${resource.duration}`}
                        </span>
                        <span>Added: {new Date(resource.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button className="flex-1 bg-green-primary hover:bg-green-600">
                        <Download className="h-4 w-4 mr-2"/>
                        Download
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Heart className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white">
                        <Share2 className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                        <ExternalLink className="h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const CategoryCard = ({category}: { category: typeof resourceCategories[0] }) => {
        const Icon = category.icon
        return (
            <Card className="hover:shadow-md transition-all duration-300 cursor-pointer border border-slate-200"
                  onClick={() => setSelectedCategory(category.name)}>
                <CardContent className="p-6 text-center">
                    <Icon className="h-12 w-12 text-green-600 mx-auto mb-3"/>
                    <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <Badge variant="outline">{category.count} resources</Badge>
                </CardContent>
            </Card>
        )
    }

    const featuredResources = resourcesData.filter(r => r.featured).slice(0, 3)
    const popularResources = resourcesData.sort((a, b) => b.downloads - a.downloads).slice(0, 4)

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Resource
                        Library</h1>
                    <p className="text-gray-600">Access {resourcesData.length} curated resources from our expert
                        alumni</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Filter className="h-4 w-4 mr-2"/>
                        My Downloads
                    </Button>
                    <Button size="sm" className="bg-green-primary hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2"/>
                        Contribute Resource
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Resources</CardTitle>
                        <BookOpen className="h-5 w-5 text-emerald-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{resourcesData.length}</div>
                        <p className="text-xs text-emerald-100 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3"/>
                            +3 this week
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
                            {resourcesData.filter(r => r.featured).length}
                        </div>
                        <p className="text-xs text-blue-100">Premium content</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Total Downloads</CardTitle>
                        <Download className="h-5 w-5 text-amber-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {resourcesData.reduce((acc, r) => acc + r.downloads, 0)}
                        </div>
                        <p className="text-xs text-amber-100">Community engagement</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Categories</CardTitle>
                        <Users className="h-5 w-5 text-purple-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{categories.length}</div>
                        <p className="text-xs text-purple-100">Topic areas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Browse by Category */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {resourceCategories.map((category) => (
                        <CategoryCard key={category.name} category={category}/>
                    ))}
                </div>
            </div>

            {/* Featured Resources */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Resources</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {featuredResources.map((resource) => (
                        <Card key={resource.id}
                              className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Star className="h-5 w-5 text-green-600"/>
                                    <Badge variant="outline" className="border-green-300 text-green-700">
                                        Featured
                                    </Badge>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{resource.description}</p>
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                                    <span>By {resource.author}</span>
                                    <span>{resource.downloads} downloads</span>
                                </div>
                                <Button size="sm" className="w-full bg-green-primary hover:bg-green-600">
                                    <Download className="h-4 w-4 mr-2"/>
                                    Download Now
                                </Button>
                            </CardContent>
                        </Card>
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
                                placeholder="Search resources by title, description, or tags..."
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
                                    {resourceTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Level"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {levels.map((level) => (
                                        <SelectItem key={level} value={level}>
                                            {level}
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
                                    setSelectedLevel("all")
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
                    Showing {filteredResources.length} of {resourcesData.length} resources
                </p>

                <Select defaultValue="downloads">
                    <SelectTrigger className="w-48 border-slate-200">
                        <SelectValue placeholder="Sort by"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="downloads">Most Downloaded</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="date">Newest First</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Resource Cards */}
            {filteredResources.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {filteredResources.map((resource) => (
                        <ResourceCard key={resource.id} resource={resource}/>
                    ))}
                </div>
            ) : (
                <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or clearing filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedCategory("all")
                                setSelectedType("all")
                                setSelectedLevel("all")
                                setFeaturedOnly(false)
                            }}
                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Popular Resources */}
            <Card className="shadow-sm">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-lg border-b">
                    <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
                        <TrendingUp className="h-6 w-6 text-orange-600"/>
                        Most Popular Resources
                    </CardTitle>
                    <CardDescription>
                        Resources with the highest download counts
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {popularResources.map((resource, index) => (
                            <div key={resource.id}
                                 className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-slate-100">
                                <div
                                    className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg text-green-700 font-semibold">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900">{resource.title}</h4>
                                    <p className="text-sm text-gray-600">By {resource.author}</p>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Download className="h-4 w-4"/>
                                        {resource.downloads}
                                    </span>
                                    <Button size="sm" variant="outline"
                                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                                        Download
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}