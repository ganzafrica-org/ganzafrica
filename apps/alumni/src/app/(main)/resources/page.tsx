"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Search,
  Download,
  ExternalLink,
  Eye,
  Heart,
  Star,
  TrendingUp,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Dummy resources data
const resourcesData = [
  {
    id: 1,
    title: "Complete Guide to Career Transition",
    description:
      "Comprehensive guide covering how to successfully transition between industries, negotiate salaries, and build new skills.",
    type: "Guide",
    category: "Career Development",
    format: "PDF",
    size: "2.4 MB",
    pages: 45,
    author: "Emma Rodriguez",
    authorTitle: "CEO, InnovateTech",
    downloads: 234,
    views: 567,
    likes: 45,
    rating: 4.8,
    reviews: 23,
    tags: ["Career", "Transition", "Salary", "Skills"],
    featured: true,
    dateAdded: "2025-07-15",
    estimatedTime: "2 hours",
    url: "#",
  },
  {
    id: 2,
    title: "Startup Funding Masterclass",
    description:
      "Learn about different funding stages, how to pitch to investors, and what VCs look for in potential investments.",
    type: "Video Course",
    category: "Entrepreneurship",
    format: "Video",
    duration: "3.5 hours",
    author: "David Williams",
    authorTitle: "Founder, EcoSolutions",
    downloads: 189,
    views: 445,
    likes: 67,
    rating: 4.9,
    reviews: 31,
    tags: ["Startup", "Funding", "Investment", "Pitch"],
    featured: true,
    dateAdded: "2025-07-10",
    estimatedTime: "3.5 hours",
    url: "#",
  },
  {
    id: 3,
    title: "Product Management Framework",
    description:
      "A proven framework for product discovery, prioritization, and execution used by top tech companies.",
    type: "Template",
    category: "Product Management",
    format: "Excel/PDF",
    size: "1.8 MB",
    author: "James Liu",
    authorTitle: "Senior PM, Google",
    downloads: 156,
    views: 289,
    likes: 34,
    rating: 4.7,
    reviews: 18,
    tags: ["Product", "Framework", "Prioritization", "Strategy"],
    featured: false,
    dateAdded: "2025-07-05",
    estimatedTime: "1 hour",
    url: "#",
  },
  {
    id: 4,
    title: "Sustainable Land Management Practices",
    description:
      "Best practices for sustainable land use, soil conservation, and biodiversity protection in African contexts.",
    type: "Report",
    category: "Land Management",
    format: "PDF",
    size: "8.5 MB",
    pages: 67,
    author: "Dr. Amina Hassan",
    authorTitle: "Environmental Scientist",
    downloads: 298,
    views: 612,
    likes: 89,
    rating: 4.9,
    reviews: 42,
    tags: ["Land", "Sustainability", "Conservation", "Biodiversity"],
    featured: true,
    dateAdded: "2025-06-28",
    estimatedTime: "3 hours",
    url: "#",
  },
  {
    id: 5,
    title: "Climate-Smart Agriculture Toolkit",
    description:
      "Practical tools and techniques for implementing climate-smart agricultural practices in smallholder farming systems.",
    type: "Toolkit",
    category: "Agriculture",
    format: "PDF",
    size: "12.3 MB",
    author: "Jean-Paul Nkunda",
    authorTitle: "Agricultural Extension Officer",
    downloads: 245,
    views: 478,
    likes: 72,
    rating: 4.8,
    reviews: 35,
    tags: ["Agriculture", "Climate", "Farming", "Sustainability"],
    featured: false,
    dateAdded: "2025-06-20",
    estimatedTime: "2.5 hours",
    url: "#",
  },
  {
    id: 6,
    title: "Water Resource Management Guide",
    description:
      "Comprehensive guide on water conservation, irrigation systems, and watershed management for sustainable development.",
    type: "Guide",
    category: "Water Resources",
    format: "PDF",
    size: "5.8 MB",
    pages: 52,
    author: "Grace Mutoni",
    authorTitle: "Water Resources Engineer",
    downloads: 178,
    views: 356,
    likes: 56,
    rating: 4.7,
    reviews: 28,
    tags: ["Water", "Conservation", "Irrigation", "Sustainability"],
    featured: false,
    dateAdded: "2025-06-15",
    estimatedTime: "2 hours",
    url: "#",
  },
  {
    id: 7,
    title: "Environmental Impact Assessment Template",
    description:
      "Professional template for conducting environmental impact assessments for development projects.",
    type: "Template",
    category: "Environmental Conservation",
    format: "Excel/Word",
    size: "3.2 MB",
    author: "Robert Ndayisaba",
    authorTitle: "Environmental Consultant",
    downloads: 203,
    views: 398,
    likes: 61,
    rating: 4.6,
    reviews: 24,
    tags: ["Environment", "Assessment", "Conservation", "Development"],
    featured: false,
    dateAdded: "2025-06-10",
    estimatedTime: "1.5 hours",
    url: "#",
  },
  {
    id: 8,
    title: "Agroforestry Implementation Guide",
    description:
      "Step-by-step guide for implementing agroforestry systems to improve food security and environmental sustainability.",
    type: "Guide",
    category: "Agriculture",
    format: "PDF",
    size: "7.1 MB",
    pages: 45,
    author: "Emmanuel Uwizeyimana",
    authorTitle: "Agroforestry Specialist",
    downloads: 167,
    views: 334,
    likes: 48,
    rating: 4.8,
    reviews: 31,
    tags: ["Agroforestry", "Food Security", "Environment", "Farming"],
    featured: false,
    dateAdded: "2025-06-05",
    estimatedTime: "2 hours",
    url: "#",
  },
];

const getDepartmentColor = (category: string) => {
  switch (category.toLowerCase()) {
    case "career development":
      return "from-emerald-500 to-green-600";
    case "entrepreneurship":
      return "from-blue-500 to-cyan-600";
    case "product management":
      return "from-amber-500 to-orange-600";
    case "land management":
      return "from-green-600 to-emerald-700";
    case "agriculture":
      return "from-lime-500 to-green-600";
    case "environmental conservation":
      return "from-teal-500 to-cyan-600";
    case "water resources":
      return "from-blue-500 to-blue-700";
    case "climate action":
      return "from-indigo-500 to-purple-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

export default function AlumniResources() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 12;

  // Filter resources based on search and filters
  const filteredResources = resourcesData.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || resource.category === selectedCategory;
    const matchesType =
      selectedType === "all" || resource.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case "downloads":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "views":
        return b.views - a.views;
      case "oldest":
        return (
          new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
        );
      default: // newest
        return (
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedResources.length / pageLimit);
  const paginatedResources = sortedResources.slice(
    (currentPage - 1) * pageLimit,
    currentPage * pageLimit,
  );

  // Get unique values for filters
  const resourceTypes = [...new Set(resourcesData.map((r) => r.type))].sort();
  const categories = [...new Set(resourcesData.map((r) => r.category))].sort();

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const ResourceCard = ({
    resource,
  }: {
    resource: (typeof resourcesData)[0];
  }) => (
    <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {resource.featured && (
                <Badge className="bg-green-primary text-white border-0">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge
                className={`bg-gradient-to-br ${getDepartmentColor(resource.category)} text-white border-0`}
              >
                {resource.type}
              </Badge>
            </div>
            <Link href={`/resources/${resource.id}`}>
              <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                {resource.title}
              </h3>
            </Link>
            <p className="text-gray-700 text-sm mb-3 line-clamp-3 flex-1">
              {resource.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="font-medium">By {resource.author}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {resource.views}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {resource.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {resource.likes}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {resource.rating}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Format: {resource.format}</span>
            <span>{resource.estimatedTime}</span>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              asChild
              className="flex-1 bg-green-primary hover:bg-green-600"
            >
              <Link href={`/resources/${resource.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Resource Library
          </h1>
          <p className="text-gray-600">
            Access {resourcesData.length} curated resources from our expert
            alumni
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="bg-green-primary hover:bg-green-600">
            <Plus className="h-4 w-4 mr-2" />
            Contribute Resource
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">
              Total Resources
            </CardTitle>
            <BookOpen className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resourcesData.length}</div>
            <p className="text-xs text-emerald-100 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +3 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Featured
            </CardTitle>
            <Star className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {resourcesData.filter((r) => r.featured).length}
            </div>
            <p className="text-xs text-blue-100">Highlighted resources</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              Total Downloads
            </CardTitle>
            <Download className="h-5 w-5 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {resourcesData.reduce((acc, r) => acc + r.downloads, 0)}
            </div>
            <p className="text-xs text-amber-100">Community engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Categories
            </CardTitle>
            <BookOpen className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-xs text-purple-100">Topic areas</p>
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
                placeholder="Search resources by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(v) => {
                  setSelectedCategory(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Category" />
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

              <Select
                value={selectedType}
                onValueChange={(v) => {
                  setSelectedType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Type" />
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

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-slate-200"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count & Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pageLimit + 1}-
          {Math.min(currentPage * pageLimit, sortedResources.length)} of{" "}
          {sortedResources.length} resources
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Resource Cards */}
      {paginatedResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paginatedResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
