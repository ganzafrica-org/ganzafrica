"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Search,
  MapPin,
  Building,
  Clock,
  DollarSign,
  ExternalLink,
  Send,
  TrendingUp,
  Globe,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  jobsApi,
  type Job,
  type JobStats,
  type TrendingSkill,
  type JobFilters,
  type Pagination,
} from "@/lib/api/alumni";

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

const JobsListSkeleton = () => (
  <div className="grid gap-6 lg:grid-cols-2">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-10" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const getSectorColor = (sector: string) => {
  switch (sector.toLowerCase()) {
    case "land":
      return "from-emerald-500 to-green-600";
    case "agriculture":
      return "from-amber-500 to-orange-600";
    case "environment":
      return "from-cyan-500 to-teal-600";
    case "communications":
      return "from-purple-500 to-indigo-600";
    case "ict":
      return "from-blue-500 to-cyan-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const formatSalary = (min: number | null, max: number | null, currency: string) => {
  if (!min && !max) return null;
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  });
  if (min && max) return `${formatter.format(min)} - ${formatter.format(max)}`;
  if (min) return `From ${formatter.format(min)}`;
  if (max) return `Up to ${formatter.format(max)}`;
  return null;
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

// Job Card Component
const JobCard = ({ job }: { job: Job }) => {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">{job.title}</h3>
            <p className="text-gray-600 flex items-center gap-1">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{job.company}</span>
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                {formatDate(job.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end flex-shrink-0 ml-2">
            <Badge
              variant={job.source === "internal" ? "default" : "secondary"}
              className={job.source === "internal" ? "bg-green-primary" : ""}
            >
              {job.source === "internal" ? "Internal" : "External"}
            </Badge>
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-br ${getSectorColor(job.sector)} text-white`}
            >
              {job.sector}
            </div>
            {job.isRemote && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                Remote
              </Badge>
            )}
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-4 line-clamp-2 flex-grow">
          {job.description || "No description available."}
        </p>

        <div className="space-y-3 mt-auto">
          {salary && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900">{salary}</span>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
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
          )}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {job.views} views
              </span>
              {job.deadline && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            className="flex-1 bg-green-primary hover:bg-green-600"
            onClick={() => job.applicationUrl && window.open(job.applicationUrl, "_blank")}
            disabled={!job.applicationUrl}
          >
            <Send className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
            onClick={() => job.applicationUrl && window.open(job.applicationUrl, "_blank")}
            disabled={!job.applicationUrl}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: JobStats }) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">Total Jobs</CardTitle>
        <Briefcase className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalJobs}</div>
        <p className="text-xs text-emerald-100 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Available opportunities
        </p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">Remote Jobs</CardTitle>
        <Globe className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.remoteJobs}</div>
        <p className="text-xs text-blue-100">Work from anywhere</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">Internal Posts</CardTitle>
        <TrendingUp className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.internalJobs}</div>
        <p className="text-xs text-amber-100">Posted by GanzAfrica</p>
      </CardContent>
    </Card>
  </div>
);

export default function AlumniJobs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "15", 10);
  const initialSearch = searchParams.get("search") || "";
  const initialSector = searchParams.get("sector") || "all";
  const initialJobType = searchParams.get("job_type") || "all";
  const initialLocation = searchParams.get("location") || "all";
  const initialRemote = searchParams.get("remote") === "true";
  const initialSource = searchParams.get("source") || "all";
  const initialSort = searchParams.get("sort") || "newest";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedSector, setSelectedSector] = useState(initialSector);
  const [selectedJobType, setSelectedJobType] = useState(initialJobType);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedSource, setSelectedSource] = useState(initialSource);
  const [remoteOnly, setRemoteOnly] = useState(initialRemote);
  const [sortBy, setSortBy] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  const [trendingSkills, setTrendingSkills] = useState<TrendingSkill[]>([]);
  const [filters, setFilters] = useState<JobFilters | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number | boolean>) => {
      const newParams = new URLSearchParams();

      newParams.set("page", params.page?.toString() || "1");
      newParams.set("limit", params.limit?.toString() || "15");

      if (params.search && params.search !== "") {
        newParams.set("search", params.search.toString());
      }
      if (params.sector && params.sector !== "all") {
        newParams.set("sector", params.sector.toString());
      }
      if (params.job_type && params.job_type !== "all") {
        newParams.set("job_type", params.job_type.toString());
      }
      if (params.location && params.location !== "all") {
        newParams.set("location", params.location.toString());
      }
      if (params.remote === true) {
        newParams.set("remote", "true");
      }
      if (params.source && params.source !== "all") {
        newParams.set("source", params.source.toString());
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
      setIsLoadingStats(true);
      try {
        const response = await jobsApi.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch trending skills
  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoadingSkills(true);
      try {
        const response = await jobsApi.getTrendingSkills();
        setTrendingSkills(response.skills);
      } catch (error) {
        console.error("Failed to fetch trending skills:", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchSkills();
  }, []);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const response = await jobsApi.getAll({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch || undefined,
          sector: selectedSector !== "all" ? selectedSector : undefined,
          job_type: selectedJobType !== "all" ? selectedJobType : undefined,
          location: selectedLocation !== "all" ? selectedLocation : undefined,
          remote: remoteOnly || undefined,
          source: selectedSource !== "all" ? selectedSource : undefined,
          sort: sortBy,
        });
        setJobs(response.jobs);
        setPagination(response.pagination);
        setFilters(response.filters);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    fetchJobs();
  }, [
    currentPage,
    pageLimit,
    debouncedSearch,
    selectedSector,
    selectedJobType,
    selectedLocation,
    remoteOnly,
    selectedSource,
    sortBy,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch,
      sector: selectedSector,
      job_type: selectedJobType,
      location: selectedLocation,
      remote: remoteOnly,
      source: selectedSource,
      sort: sortBy,
    });
  }, [
    currentPage,
    pageLimit,
    debouncedSearch,
    selectedSector,
    selectedJobType,
    selectedLocation,
    remoteOnly,
    selectedSource,
    sortBy,
    updateUrlParams,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSector("all");
    setSelectedJobType("all");
    setSelectedLocation("all");
    setSelectedSource("all");
    setRemoteOnly(false);
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
          Job Opportunities
        </h1>
        <p className="text-gray-600">
          Discover career opportunities in land, agriculture, environment, and more
        </p>
      </div>

      {/* Quick Stats */}
      {isLoadingStats ? <StatsSkeleton /> : stats && <StatsCards stats={stats} />}

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, company, or description..."
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
                value={selectedSector}
                onValueChange={(v) => {
                  setSelectedSector(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {filters?.sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedJobType}
                onValueChange={(v) => {
                  setSelectedJobType(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {filters?.jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSource}
                onValueChange={(v) => {
                  setSelectedSource(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="internal">Internal</SelectItem>
                  <SelectItem value="scraped">External</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={remoteOnly ? "default" : "outline"}
                onClick={() => {
                  setRemoteOnly(!remoteOnly);
                  setCurrentPage(1);
                }}
                className={`justify-start ${
                  remoteOnly
                    ? "bg-blue-secondary hover:bg-blue-600"
                    : "border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
                }`}
              >
                <Globe className="h-4 w-4 mr-2" />
                Remote Only
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results and Sort */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(
                currentPage * pagination.limit,
                pagination.totalCount,
              )} of ${pagination.totalCount} jobs`
            : "Loading..."}
        </p>

        <div className="flex items-center gap-4">
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
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={!pagination.hasMore}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 border-slate-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="salary-high">Salary: High to Low</SelectItem>
              <SelectItem value="salary-low">Salary: Low to High</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="company">Company A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Job Listings */}
      {isLoadingJobs ? (
        <JobsListSkeleton />
      ) : jobs.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No jobs found</h3>
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
            onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Trending Skills */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-lg border-b">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-800">
            <TrendingUp className="h-6 w-6 text-orange-600" />
            Trending Skills
          </CardTitle>
          <CardDescription>Most in-demand skills across all job postings</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoadingSkills ? (
            <div className="flex flex-wrap gap-2">
              {[...Array(12)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          ) : trendingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {trendingSkills.map((item) => (
                <Badge
                  key={item.skill}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                  onClick={() => {
                    setSearchTerm(item.skill);
                    setCurrentPage(1);
                  }}
                >
                  {item.skill} ({item.count})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No trending skills data available yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
