"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  Globe,
  MessageSquare,
  Briefcase,
  TrendingUp,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { alumniApi, Alumni, AlumniStats, AlumniFilters, Pagination } from "@/lib/api/alumni";

const getDepartmentColor = (industry: string) => {
  switch (industry?.toLowerCase()) {
    case "technology":
      return "from-emerald-500 to-green-600";
    case "environmental":
      return "from-blue-500 to-cyan-600";
    case "finance":
      return "from-amber-500 to-orange-600";
    case "research":
      return "from-purple-500 to-indigo-600";
    case "entertainment":
      return "from-pink-500 to-rose-600";
    case "fintech":
      return "from-cyan-500 to-blue-600";
    default:
      return "from-slate-500 to-slate-600";
  }
};

const getWhatsAppConnectUrl = (phone: string | null, name: string) => {
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Hi ${name}, I'm a fellow GanzAfrica alumni and I'd love to connect with you!`,
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
};

// Skeleton Components
const StatsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {[...Array(4)].map((_, i) => (
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

const AlumniListSkeleton = () => (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Alumni List Item Component
const AlumniListItem = ({
  alumni,
  currentUserId,
}: {
  alumni: Alumni;
  currentUserId: string | null;
}) => {
  const whatsappUrl = getWhatsAppConnectUrl(alumni.phone, alumni.name);
  const isCurrentUser = currentUserId && alumni.id.toString() === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            {alumni.avatar ? (
              <AvatarImage src={alumni.avatar} alt={alumni.name} />
            ) : (
              <AvatarFallback
                className={`bg-gradient-to-br ${getDepartmentColor(alumni.industry)} text-white`}
              >
                {alumni.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            )}
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{alumni.name}</h3>
                <p className="text-sm text-gray-600">
                  {alumni.title} {alumni.company && `at ${alumni.company}`}
                </p>
                <p className="text-xs text-gray-500">{alumni.location}</p>
              </div>

              <div className="flex items-center gap-2">
                {alumni.graduationYear && (
                  <Badge variant="secondary" className="text-xs">
                    {alumni.graduationYear}
                  </Badge>
                )}
                {alumni.activeMenteesCount > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Heart className="h-3 w-3 mr-1" />
                    {alumni.activeMenteesCount}
                  </Badge>
                )}
                {!isCurrentUser && (
                  <div className="flex gap-1 ml-4">
                    {whatsappUrl ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-500 hover:text-white"
                        onClick={() => window.open(whatsappUrl, "_blank")}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Connect
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-300 text-gray-400"
                        disabled
                      >
                        No Contact
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Cards Component
const StatsCards = ({ stats }: { stats: AlumniStats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">Total Alumni</CardTitle>
        <Users className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.totalAlumni}</div>
        <p className="text-xs text-emerald-100 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Growing community
        </p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">Active Mentors</CardTitle>
        <Heart className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.alumniWithMentees}</div>
        <p className="text-xs text-blue-100">With active mentees</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">Countries</CardTitle>
        <Globe className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.countriesCount}</div>
        <p className="text-xs text-amber-100">Global presence</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">Industries</CardTitle>
        <Briefcase className="h-5 w-5 text-purple-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.industriesCount}</div>
        <p className="text-xs text-purple-100">Diverse sectors</p>
      </CardContent>
    </Card>
  </div>
);

export default function AlumniDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "15", 10);
  const initialCountry = searchParams.get("country") || "all";
  const initialIndustry = searchParams.get("industry") || "all";
  const initialYear = searchParams.get("year") || "all";
  const initialSearch = searchParams.get("search") || "";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);

  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [stats, setStats] = useState<AlumniStats | null>(null);
  const [filters, setFilters] = useState<AlumniFilters | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAlumni, setIsLoadingAlumni] = useState(true);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Update URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams();

      // Always include page and limit
      newParams.set("page", params.page?.toString() || "1");
      newParams.set("limit", params.limit?.toString() || "15");

      // Add filter params
      if (params.country && params.country !== "all") {
        newParams.set("country", params.country.toString());
      }
      if (params.industry && params.industry !== "all") {
        newParams.set("industry", params.industry.toString());
      }
      if (params.year && params.year !== "all") {
        newParams.set("year", params.year.toString());
      }
      if (params.search && params.search !== "") {
        newParams.set("search", params.search.toString());
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
        const response = await alumniApi.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Failed to fetch alumni stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch alumni list
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setIsLoadingAlumni(true);
        const response = await alumniApi.getAll({
          page: currentPage,
          limit: pageLimit,
          country: selectedCountry,
          industry: selectedIndustry,
          graduationYear: selectedYear,
          search: debouncedSearch,
        });

        setAlumni(response.alumni);
        setPagination(response.pagination);
        setFilters(response.filters);
      } catch (error) {
        console.error("Failed to fetch alumni:", error);
      } finally {
        setIsLoadingAlumni(false);
      }
    };

    fetchAlumni();
  }, [currentPage, pageLimit, selectedCountry, selectedIndustry, selectedYear, debouncedSearch]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      country: selectedCountry,
      industry: selectedIndustry,
      year: selectedYear,
      search: debouncedSearch,
    });
  }, [
    currentPage,
    pageLimit,
    selectedCountry,
    selectedIndustry,
    selectedYear,
    debouncedSearch,
    updateUrlParams,
  ]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCountry("all");
    setSelectedIndustry("all");
    setSelectedYear("all");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Alumni Directory
          </h1>
          <p className="text-gray-600">
            Connect with {stats?.totalAlumni || 0} amazing alumni from our community
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      {isLoadingStats ? <StatsSkeleton /> : stats && <StatsCards stats={stats} />}

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, company, title, or skills..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select
                value={selectedCountry}
                onValueChange={(v) => handleFilterChange(setSelectedCountry, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {filters?.countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedIndustry}
                onValueChange={(v) => handleFilterChange(setSelectedIndustry, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {filters?.industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedYear}
                onValueChange={(v) => handleFilterChange(setSelectedYear, v)}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Graduation Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {filters?.graduationYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      Class of {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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

      {/* Results Count & Pagination Info */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(currentPage * pagination.limit, pagination.totalCount)} of ${pagination.totalCount} alumni`
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
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={!pagination.hasMore}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Alumni List */}
      {isLoadingAlumni ? (
        <AlumniListSkeleton />
      ) : alumni.length > 0 ? (
        <div className="space-y-4">
          {alumni.map((alumniItem) => (
            <AlumniListItem
              key={alumniItem.id}
              alumni={alumniItem}
              currentUserId={user?.id || null}
            />
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
    </div>
  );
}
