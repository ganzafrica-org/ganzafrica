"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Search,
  Award,
  Plus,
  Calendar,
  Building,
  MapPin,
  ExternalLink,
  Eye,
  ThumbsUp,
  MessageSquare,
  Briefcase,
  Globe,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  achievementsApi,
  Achievement,
  AchievementStats,
  AchievementFilters,
  Pagination,
} from "@/lib/api/alumni";
import Link from "next/link";

const getDepartmentColor = (category: string) => {
  switch (category?.toLowerCase()) {
    case "recognition":
      return "from-yellow-500 to-orange-600";
    case "professional":
      return "from-blue-500 to-cyan-600";
    case "business milestone":
      return "from-emerald-500 to-green-600";
    case "academic":
      return "from-purple-500 to-indigo-600";
    case "competition":
      return "from-red-500 to-pink-600";
    case "community":
      return "from-indigo-500 to-purple-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

// Skeleton Components
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const AchievementListSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Stats Cards Component
const StatsCards = ({ stats }: { stats: AchievementStats }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">
          Total Achievements
        </CardTitle>
        <Trophy className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalAchievements}</div>
        <p className="text-xs text-emerald-100">Community accomplishments</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">
          Your Achievements
        </CardTitle>
        <Award className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.myAchievements}</div>
        <p className="text-xs text-blue-100">Your shared wins</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          Categories
        </CardTitle>
        <Globe className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.categoriesCount}</div>
        <p className="text-xs text-amber-100">Different areas</p>
      </CardContent>
    </Card>
  </div>
);

// Achievement Card Component
const AchievementCard = ({
  achievement,
  onLike,
}: {
  achievement: Achievement;
  onLike: (id: number) => void;
}) => (
  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border border-slate-200 h-full flex flex-col">
    <CardContent className="p-6 flex-1 flex flex-col">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 flex-shrink-0">
          {achievement.achiever.avatar ? (
            <AvatarImage
              src={achievement.achiever.avatar}
              alt={achievement.achiever.name}
            />
          ) : (
            <AvatarFallback
              className={`bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white font-semibold`}
            >
              {achievement.achiever.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <Link href={`/achievements/${achievement.id}`}>
                <h3 className="font-semibold text-lg text-gray-900 mb-1 hover:text-blue-600 line-clamp-2">
                  {achievement.title}
                </h3>
              </Link>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="font-medium truncate">
                  {achievement.achiever.name}
                </span>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(achievement.category)} text-white flex-shrink-0 ml-2`}
            >
              {achievement.category}
            </div>
          </div>

          {achievement.description && (
            <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-1">
              {achievement.description}
            </p>
          )}

          <div className="space-y-3 mt-auto">
            <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
              {achievement.organization && (
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4 text-orange-500" />
                  <span className="truncate max-w-[120px]">
                    {achievement.organization}
                  </span>
                </span>
              )}
              {achievement.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  {new Date(achievement.date).toLocaleDateString()}
                </span>
              )}
            </div>

            {achievement.tags && achievement.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {achievement.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {achievement.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{achievement.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {achievement.views}
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4" />
                  {achievement.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {achievement.comments}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    onLike(achievement.id);
                  }}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {achievement.likes}
                </Button>
                {achievement.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
                    asChild
                  >
                    <a
                      href={achievement.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
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
);

// Submission Form Component
const SubmissionForm = ({
  categories,
  onSubmit,
  onCancel,
}: {
  categories: string[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    type: "",
    organization: "",
    date: "",
    link: "",
    tags: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title || !formData.category) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((t) => t.trim())
          : [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b">
        <CardTitle className="text-xl text-slate-800">
          Share Your Achievement
        </CardTitle>
        <CardDescription>
          Let the community celebrate your success! Share your recent
          achievement with fellow alumni.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Achievement Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g., Promoted to Senior Engineer"
              className="border-slate-200"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.category}
              onValueChange={(v) => setFormData({ ...formData, category: v })}
            >
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Select category" />
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
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Organization</label>
            <Input
              placeholder="Company or organization name"
              className="border-slate-200"
              value={formData.organization}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <Input
              type="date"
              className="border-slate-200"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Input
              placeholder="e.g., Award, Funding, Publication"
              className="border-slate-200"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Link (optional)</label>
            <Input
              placeholder="Link to news article, press release, etc."
              className="border-slate-200"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (comma separated)</label>
          <Input
            placeholder="e.g., Leadership, Innovation, AI"
            className="border-slate-200"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            className="bg-green-primary hover:bg-green-600"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title || !formData.category}
          >
            {isSubmitting ? "Submitting..." : "Submit Achievement"}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-slate-200"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AlumniAchievements() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "15", 10);
  const initialCategory = searchParams.get("category") || "all";
  const initialType = searchParams.get("type") || "all";
  const initialYear = searchParams.get("year") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "newest";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [filters, setFilters] = useState<AchievementFilters | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams();

      newParams.set("page", params.page?.toString() || "1");
      newParams.set("limit", params.limit?.toString() || "15");

      if (params.category && params.category !== "all") {
        newParams.set("category", params.category.toString());
      }
      if (params.type && params.type !== "all") {
        newParams.set("type", params.type.toString());
      }
      if (params.year && params.year !== "all") {
        newParams.set("year", params.year.toString());
      }
      if (params.search && params.search !== "") {
        newParams.set("search", params.search.toString());
      }
      if (params.sort && params.sort !== "newest") {
        newParams.set("sort", params.sort.toString());
      }

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await achievementsApi.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Failed to fetch achievement stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoadingAchievements(true);
        const response = await achievementsApi.getAll({
          page: currentPage,
          limit: pageLimit,
          category: selectedCategory,
          type: selectedType,
          year: selectedYear,
          search: debouncedSearch,
          sort: sortBy,
        });

        setAchievements(response.achievements);
        setPagination(response.pagination);
        setFilters(response.filters);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [
    currentPage,
    pageLimit,
    selectedCategory,
    selectedType,
    selectedYear,
    debouncedSearch,
    sortBy,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      category: selectedCategory,
      type: selectedType,
      year: selectedYear,
      search: debouncedSearch,
      sort: sortBy,
    });
  }, [
    currentPage,
    pageLimit,
    selectedCategory,
    selectedType,
    selectedYear,
    debouncedSearch,
    sortBy,
    updateUrlParams,
  ]);

  // Reset to page 1 when filters change
  const handleFilterChange = (
    setter: (value: string) => void,
    value: string,
  ) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedType("all");
    setSelectedYear("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handleLike = async (id: number) => {
    try {
      const result = await achievementsApi.toggleLike(id);
      setAchievements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, likes: result.likes } : a)),
      );
    } catch (error) {
      console.error("Failed to like achievement:", error);
    }
  };

  const handleSubmitAchievement = async (data: any) => {
    try {
      await achievementsApi.create(data);
      setShowSubmissionForm(false);
      // Refresh stats and achievements
      const [statsRes, achievementsRes] = await Promise.all([
        achievementsApi.getStats(),
        achievementsApi.getAll({
          page: 1,
          limit: pageLimit,
          sort: "newest",
        }),
      ]);
      setStats(statsRes.stats);
      setAchievements(achievementsRes.achievements);
      setPagination(achievementsRes.pagination);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to create achievement:", error);
    }
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Alumni Achievements
          </h1>
          <p className="text-gray-600">
            Celebrate amazing accomplishments from our community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowSubmissionForm(!showSubmissionForm)}
            className="bg-green-primary hover:bg-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Achievement
          </Button>
        </div>
      </div>

      {/* Submission Form */}
      {showSubmissionForm && (
        <SubmissionForm
          categories={
            filters?.categories || [
              "Recognition",
              "Professional",
              "Business Milestone",
              "Academic",
              "Competition",
              "Community",
            ]
          }
          onSubmit={handleSubmitAchievement}
          onCancel={() => setShowSubmissionForm(false)}
        />
      )}

      {/* Stats Overview */}
      {isLoadingStats ? (
        <StatsSkeleton />
      ) : (
        stats && <StatsCards stats={stats} />
      )}

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements by title, description, or organization..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(v) =>
                  handleFilterChange(setSelectedCategory, v)
                }
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {filters?.categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedType}
                onValueChange={(v) => handleFilterChange(setSelectedType, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filters?.types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear}
                onValueChange={(v) => handleFilterChange(setSelectedYear, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {filters?.years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
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
                  <SelectItem value="most-liked">Most Liked</SelectItem>
                  <SelectItem value="most-viewed">Most Viewed</SelectItem>
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
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(currentPage * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} achievements`
            : "Loading..."}
        </p>
        {pagination && pagination.totalPages > 1 && (
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
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Achievement Cards */}
      {isLoadingAchievements ? (
        <AchievementListSkeleton />
      ) : achievements.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              onLike={handleLike}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No achievements found
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
      {pagination && pagination.totalPages > 1 && (
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
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={!pagination.hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
