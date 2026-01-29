"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Calendar,
    Search,
    Filter,
    MapPin,
    Clock,
    Users,
    ExternalLink,
    BookmarkPlus,
    Share2,
    Video,
    Globe,
    Building,
    Star,
    TrendingUp,
    Eye,
    Heart,
    MessageSquare,
    Plus,
    Download
} from "lucide-react"

// Dummy events data
const eventsData = [
    {
        id: 1,
        title: "Tech Career Fair 2025",
        description: "Connect with top tech companies and explore exciting career opportunities. Network with fellow alumni and industry leaders.",
        date: "2025-08-25",
        time: "10:00 AM - 4:00 PM",
        location: "Virtual Event",
        type: "Career",
        category: "Professional Development",
        organizer: "Alumni Association",
        attendees: 156,
        maxAttendees: 200,
        registered: false,
        featured: true,
        image: null,
        speakers: [
            { name: "Emma Rodriguez", title: "CEO, InnovateTech", company: "InnovateTech" },
            { name: "James Liu", title: "PM, Google", company: "Google" }
        ],
        agenda: [
            { time: "10:00 AM", activity: "Opening Keynote" },
            { time: "11:00 AM", activity: "Company Presentations" },
            { time: "2:00 PM", activity: "Networking Sessions" },
            { time: "3:30 PM", activity: "Panel Discussion" }
        ],
        tags: ["Career", "Technology", "Networking"],
        price: "Free",
        virtual: true,
        status: "Open"
    },
    {
        id: 2,
        title: "Alumni Networking Mixer",
        description: "Join us for an evening of networking, drinks, and conversations with alumni from various industries and graduation years.",
        date: "2025-08-30",
        time: "6:00 PM - 9:00 PM",
        location: "Kigali Convention Center, Kigali",
        type: "Networking",
        category: "Social",
        organizer: "Kigali Chapter",
        attendees: 89,
        maxAttendees: 120,
        registered: true,
        featured: false,
        image: null,
        speakers: [],
        agenda: [
            { time: "6:00 PM", activity: "Registration & Welcome Drinks" },
            { time: "6:30 PM", activity: "Icebreaker Activities" },
            { time: "7:30 PM", activity: "Open Networking" },
            { time: "8:30 PM", activity: "Closing Remarks" }
        ],
        tags: ["Networking", "Social", "Local"],
        price: "$25",
        virtual: false,
        status: "Open"
    },
    {
        id: 3,
        title: "Entrepreneurship Workshop",
        description: "Learn from successful alumni entrepreneurs about building startups, raising funding, and scaling businesses.",
        date: "2025-09-05",
        time: "2:00 PM - 5:00 PM",
        location: "Innovation Hub, Nairobi",
        type: "Workshop",
        category: "Education",
        organizer: "Nairobi Chapter",
        attendees: 45,
        maxAttendees: 60,
        registered: false,
        featured: true,
        image: null,
        speakers: [
            { name: "David Williams", title: "Founder, EcoSolutions", company: "EcoSolutions" },
            { name: "Aisha Patel", title: "Venture Partner", company: "Growth Capital" }
        ],
        agenda: [
            { time: "2:00 PM", activity: "Startup Fundamentals" },
            { time: "3:00 PM", activity: "Funding Strategies" },
            { time: "4:00 PM", activity: "Scaling Your Business" },
            { time: "4:45 PM", activity: "Q&A Session" }
        ],
        tags: ["Entrepreneurship", "Startups", "Business"],
        price: "$50",
        virtual: false,
        status: "Open"
    },
    {
        id: 4,
        title: "Data Science Masterclass",
        description: "Deep dive into advanced data science techniques, machine learning, and AI applications with industry experts.",
        date: "2025-09-12",
        time: "1:00 PM - 4:00 PM",
        location: "Virtual Event",
        type: "Workshop",
        category: "Education",
        organizer: "Tech Alumni Group",
        attendees: 78,
        maxAttendees: 100,
        registered: true,
        featured: false,
        image: null,
        speakers: [
            { name: "Fatima Al-Zahra", title: "Data Scientist, Netflix", company: "Netflix" },
            { name: "Michael Chen", title: "ML Engineer, Stripe", company: "Stripe" }
        ],
        agenda: [
            { time: "1:00 PM", activity: "Advanced ML Techniques" },
            { time: "2:15 PM", activity: "Industry Case Studies" },
            { time: "3:15 PM", activity: "Hands-on Workshop" },
            { time: "3:45 PM", activity: "Q&A & Networking" }
        ],
        tags: ["Data Science", "Machine Learning", "Technology"],
        price: "Free",
        virtual: true,
        status: "Open"
    },
    {
        id: 5,
        title: "Annual Alumni Gala",
        description: "Celebrate our community's achievements, honor outstanding alumni, and enjoy an evening of entertainment and recognition.",
        date: "2025-09-20",
        time: "7:00 PM - 11:00 PM",
        location: "Grand Ballroom, Serena Hotel Kigali",
        type: "Gala",
        category: "Social",
        organizer: "Alumni Association",
        attendees: 203,
        maxAttendees: 250,
        registered: false,
        featured: true,
        image: null,
        speakers: [
            { name: "Dr. John Nkurunziza", title: "Keynote Speaker", company: "University of Rwanda" },
            { name: "Emma Rodriguez", title: "Alumni of the Year", company: "InnovateTech" }
        ],
        agenda: [
            { time: "7:00 PM", activity: "Cocktail Reception" },
            { time: "8:00 PM", activity: "Dinner & Awards Ceremony" },
            { time: "9:30 PM", activity: "Live Entertainment" },
            { time: "10:30 PM", activity: "After Party" }
        ],
        tags: ["Gala", "Awards", "Celebration"],
        price: "$75",
        virtual: false,
        status: "Open"
    },
    {
        id: 6,
        title: "Product Management Bootcamp",
        description: "Intensive workshop covering product strategy, user research, data analysis, and product leadership for aspiring PMs.",
        date: "2025-09-28",
        time: "9:00 AM - 5:00 PM",
        location: "Lagos Business School, Nigeria",
        type: "Bootcamp",
        category: "Education",
        organizer: "Lagos Chapter",
        attendees: 32,
        maxAttendees: 40,
        registered: false,
        featured: false,
        image: null,
        speakers: [
            { name: "James Liu", title: "Senior PM, Google", company: "Google" },
            { name: "Sarah Johnson", title: "Head of Product", company: "Fintech Startup" }
        ],
        agenda: [
            { time: "9:00 AM", activity: "Product Strategy Fundamentals" },
            { time: "11:00 AM", activity: "User Research Methods" },
            { time: "2:00 PM", activity: "Data-Driven Product Decisions" },
            { time: "4:00 PM", activity: "Product Leadership" }
        ],
        tags: ["Product Management", "Strategy", "Leadership"],
        price: "$100",
        virtual: false,
        status: "Open"
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
        case 'bootcamp':
            return 'from-purple-500 to-indigo-600'
        case 'gala':
            return 'from-pink-500 to-rose-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export default function AlumniEvents() {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedType, setSelectedType] = useState("all")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [selectedLocation, setSelectedLocation] = useState("all")
    const [virtualOnly, setVirtualOnly] = useState(false)
    const [featuredOnly, setFeaturedOnly] = useState(false)
    const [registeredOnly, setRegisteredOnly] = useState(false)

    // Filter events based on search and filters
    const filteredEvents = eventsData.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesType = selectedType === "all" || event.type === selectedType
        const matchesCategory = selectedCategory === "all" || event.category === selectedCategory
        const matchesLocation = selectedLocation === "all" || event.location.includes(selectedLocation)
        const matchesVirtual = !virtualOnly || event.virtual
        const matchesFeatured = !featuredOnly || event.featured
        const matchesRegistered = !registeredOnly || event.registered

        return matchesSearch && matchesType && matchesCategory && matchesLocation && matchesVirtual && matchesFeatured && matchesRegistered
    })

    // Get unique values for filters
    const eventTypes = [...new Set(eventsData.map(e => e.type))].sort()
    const categories = [...new Set(eventsData.map(e => e.category))].sort()
    const locations = [...new Set(eventsData.map(e => e.location.split(',')[1]?.trim() || e.location))].filter(l => l !== "Virtual Event").sort()

    const EventCard = ({event}: { event: typeof eventsData[0] }) => (
        <Card
            className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200 ${event.featured ? 'ring-2 ring-green-200 bg-green-50/30' : ''}`}>
            {event.featured && (
                <div
                    className="bg-green-primary text-white text-xs font-medium px-3 py-1 rounded-t-lg flex items-center gap-1">
                    <Star className="h-3 w-3"/>
                    Featured Event
                </div>
            )}
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{event.title}</h3>
                        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{event.description}</p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-blue-500"/>
                                    {new Date(event.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4 text-emerald-500"/>
                                    {event.time}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-orange-500"/>
                                    {event.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4 text-amber-500"/>
                                    {event.attendees}/{event.maxAttendees} attending
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <Badge variant={event.registered ? 'default' : 'outline'}
                               className={event.registered ? 'bg-green-primary' : ''}>
                            {event.registered ? 'Registered' : event.status}
                        </Badge>
                        <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(event.type)} text-white`}>
                            {event.type}
                        </div>
                        {event.virtual && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                                <Video className="h-3 w-3 mr-1"/>
                                Virtual
                            </Badge>
                        )}
                        <span className="text-sm font-medium text-green-600">{event.price}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {event.speakers.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Speakers</h4>
                            <div className="space-y-1">
                                {event.speakers.slice(0, 2).map((speaker, index) => (
                                    <div key={index} className="text-xs text-gray-600">
                                        <span className="font-medium">{speaker.name}</span> - {speaker.title}
                                    </div>
                                ))}
                                {event.speakers.length > 2 && (
                                    <div className="text-xs text-gray-500">
                                        +{event.speakers.length - 2} more speakers
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-xs text-gray-500">
                            Organized by {event.organizer}
                        </div>
                        <div className="text-xs text-gray-500">
                            {Math.round((event.attendees / event.maxAttendees) * 100)}% full
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <Button
                        className="flex-1"
                        variant={event.registered ? "outline" : "default"}
                        disabled={event.attendees >= event.maxAttendees && !event.registered}
                    >
                        {event.registered ? 'Registered' :
                            event.attendees >= event.maxAttendees ? 'Full' : 'Register'}
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <BookmarkPlus className="h-4 w-4"/>
                    </Button>
                    <Button variant="outline" size="icon"
                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white">
                        <Share2 className="h-4 w-4"/>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const upcomingEvents = eventsData.filter(event => new Date(event.date) >= new Date()).slice(0, 3)

    return (
        <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">Alumni
                        Events</h1>
                    <p className="text-gray-600">Discover and join {eventsData.length} amazing events in our
                        community</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm"
                            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white">
                        <Calendar className="h-4 w-4 mr-2"/>
                        My Calendar
                    </Button>
                    <Button size="sm" className="bg-green-primary hover:bg-green-600">
                        <Plus className="h-4 w-4 mr-2"/>
                        Create Event
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card
                    className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Total Events</CardTitle>
                        <Calendar className="h-5 w-5 text-emerald-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{eventsData.length}</div>
                        <p className="text-xs text-emerald-100">This month</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Featured Events</CardTitle>
                        <Star className="h-5 w-5 text-blue-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {eventsData.filter(e => e.featured).length}
                        </div>
                        <p className="text-xs text-blue-100">Premium content</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Virtual Events</CardTitle>
                        <Video className="h-5 w-5 text-amber-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {eventsData.filter(e => e.virtual).length}
                        </div>
                        <p className="text-xs text-amber-100">Online access</p>
                    </CardContent>
                </Card>

                <Card
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">My Events</CardTitle>
                        <Users className="h-5 w-5 text-purple-200"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {eventsData.filter(e => e.registered).length}
                        </div>
                        <p className="text-xs text-purple-100">Registered</p>
                    </CardContent>
                </Card>
            </div>

            {/* Featured Upcoming Events */}
            <Card className="bg-gradient-to-r from-green-primary to-green-secondary text-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-white text-xl">Don't Miss These Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                        {upcomingEvents.map((event) => (
                            <div key={event.id}
                                 className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                                <h4 className="font-semibold mb-1">{event.title}</h4>
                                <p className="text-sm text-green-100 mb-2">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                                <div
                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-br ${getDepartmentColor(event.type)} text-white mb-2`}>
                                    {event.type}
                                </div>
                                <Button variant="secondary" size="sm" className="w-full">
                                    Register Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card className="shadow-sm">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                placeholder="Search events by title, description, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                            />
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue placeholder="Event Type"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {eventTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

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

                            <Button
                                variant={virtualOnly ? "default" : "outline"}
                                onClick={() => setVirtualOnly(!virtualOnly)}
                                className={`justify-start ${virtualOnly ? 'bg-blue-secondary hover:bg-blue-600' : 'border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white'}`}
                            >
                                <Video className="h-4 w-4 mr-2"/>
                                Virtual
                            </Button>

                            <Button
                                variant={featuredOnly ? "default" : "outline"}
                                onClick={() => setFeaturedOnly(!featuredOnly)}
                                className={`justify-start ${featuredOnly ? 'bg-green-primary hover:bg-green-600' : 'border-green-primary text-green-primary hover:bg-green-primary hover:text-white'}`}
                            >
                                <Star className="h-4 w-4 mr-2"/>
                                Featured
                            </Button>

                            <Button
                                variant={registeredOnly ? "default" : "outline"}
                                onClick={() => setRegisteredOnly(!registeredOnly)}
                                className={`justify-start ${registeredOnly ? 'bg-orange-primary hover:bg-orange-600' : 'border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white'}`}
                            >
                                <Heart className="h-4 w-4 mr-2"/>
                                My Events
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setSelectedType("all")
                                    setSelectedCategory("all")
                                    setSelectedLocation("all")
                                    setVirtualOnly(false)
                                    setFeaturedOnly(false)
                                    setRegisteredOnly(false)
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
                    Showing {filteredEvents.length} of {eventsData.length} events
                </p>

                <Select defaultValue="date">
                    <SelectTrigger className="w-48 border-slate-200">
                        <SelectValue placeholder="Sort by"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="date">Date (Nearest First)</SelectItem>
                        <SelectItem value="date-desc">Date (Furthest First)</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                        <SelectItem value="attendees">Most Popular</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Event Cards */}
            {filteredEvents.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event}/>
                    ))}
                </div>
            ) : (
                <Card className="shadow-sm">
                    <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
                        <p className="text-gray-600 mb-4">
                            Try adjusting your search criteria or clearing filters
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchTerm("")
                                setSelectedType("all")
                                setSelectedCategory("all")
                                setSelectedLocation("all")
                                setVirtualOnly(false)
                                setFeaturedOnly(false)
                                setRegisteredOnly(false)
                            }}
                            className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                        >
                            Clear All Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}