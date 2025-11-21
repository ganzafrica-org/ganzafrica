"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Search,
  UserPlus,
  Heart,
  Target,
  Star,
  TrendingUp,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  mentorshipApi,
  type Fellow,
  type MentorshipStats,
} from "@/lib/api/alumni";

// Types
interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

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

const FellowsListSkeleton = () => (
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
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Fellow List Item Component
const FellowListItem = ({
  fellow,
  onAddMentee,
  isAdding,
}: {
  fellow: Fellow;
  onAddMentee: (fellowId: number) => void;
  isAdding: boolean;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
              {fellow.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{fellow.name}</h3>
                <p className="text-sm text-gray-600">{fellow.fellowRole}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={fellow.isAvailable ? "default" : "secondary"}
                  className={fellow.isAvailable ? "bg-green-500" : ""}
                >
                  {fellow.isAvailable ? "Available" : "Has Mentor"}
                </Badge>
                {fellow.isAvailable && (
                  <Button
                    size="sm"
                    className="bg-green-primary hover:bg-green-600"
                    onClick={() => onAddMentee(fellow.id)}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add as Mentee
                      </>
                    )}
                  </Button>
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
const StatsCards = ({ stats }: { stats: MentorshipStats }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-emerald-100">
          Available Mentees
        </CardTitle>
        <Users className="h-5 w-5 text-emerald-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.availableMentees}</div>
        <p className="text-xs text-emerald-100 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          Fellows without mentors
        </p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-blue-100">
          Active Relationships
        </CardTitle>
        <Heart className="h-5 w-5 text-blue-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.activeRelationships}</div>
        <p className="text-xs text-blue-100">Mentor-mentee pairs</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-amber-100">
          Sessions Completed
        </CardTitle>
        <Target className="h-5 w-5 text-amber-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.sessionsCompleted}</div>
        <p className="text-xs text-amber-100">Total mentoring sessions</p>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-purple-100">
          Average Rating
        </CardTitle>
        <Star className="h-5 w-5 text-purple-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{stats.averageRating}</div>
        <p className="text-xs text-purple-100">Mentee satisfaction</p>
      </CardContent>
    </Card>
  </div>
);

export default function MentorshipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "15", 10);
  const initialSearch = searchParams.get("search") || "";
  const initialAvailableOnly = searchParams.get("available") === "true";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [availableOnly, setAvailableOnly] = useState(initialAvailableOnly);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);

  const [fellows, setFellows] = useState<Fellow[]>([]);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingFellows, setIsLoadingFellows] = useState(true);
  const [addingMenteeId, setAddingMenteeId] = useState<number | null>(null);

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
      if (params.available === true) {
        newParams.set("available", "true");
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
        const response = await mentorshipApi.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch fellows list
  useEffect(() => {
    const fetchFellows = async () => {
      setIsLoadingFellows(true);
      try {
        const response = await mentorshipApi.getFellows({
          page: currentPage,
          limit: pageLimit,
          search: debouncedSearch || undefined,
          available: availableOnly || undefined,
        });
        setFellows(response.fellows);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Failed to fetch fellows:", error);
      } finally {
        setIsLoadingFellows(false);
      }
    };

    fetchFellows();
  }, [currentPage, pageLimit, debouncedSearch, availableOnly]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      search: debouncedSearch,
      available: availableOnly,
    });
  }, [currentPage, pageLimit, debouncedSearch, availableOnly, updateUrlParams]);

  const handleAddMentee = async (fellowId: number) => {
    setAddingMenteeId(fellowId);
    try {
      await mentorshipApi.addMentee(fellowId);
      toast.success("Mentee added successfully!");
      // Refresh the list
      setFellows((prev) =>
        prev.map((f) => (f.id === fellowId ? { ...f, isAvailable: false } : f)),
      );
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add mentee");
    } finally {
      setAddingMenteeId(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setAvailableOnly(false);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Find Mentees
          </h1>
          <p className="text-gray-600">
            Connect with fellows and guide them in their career journey
          </p>
        </div>
      </div>

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
                placeholder="Search by name or fellow role..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant={availableOnly ? "default" : "outline"}
                onClick={() => {
                  setAvailableOnly(!availableOnly);
                  setCurrentPage(1);
                }}
                className={
                  availableOnly
                    ? "bg-green-primary hover:bg-green-600"
                    : "border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                }
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Available Only
              </Button>

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

      {/* Results Count & Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {pagination
            ? `Showing ${(currentPage - 1) * pagination.limit + 1}-${Math.min(
                currentPage * pagination.limit,
                pagination.totalCount,
              )} of ${pagination.totalCount} fellows`
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

      {/* Fellows List */}
      {isLoadingFellows ? (
        <FellowsListSkeleton />
      ) : fellows.length > 0 ? (
        <div className="space-y-4">
          {fellows.map((fellow) => (
            <FellowListItem
              key={fellow.id}
              fellow={fellow}
              onAddMentee={handleAddMentee}
              isAdding={addingMenteeId === fellow.id}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No fellows found
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
