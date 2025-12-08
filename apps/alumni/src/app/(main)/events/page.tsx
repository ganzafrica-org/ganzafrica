"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  Search,
  MapPin,
  Clock,
  Users,
  Share2,
  Video,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { eventsApi, type Event } from "@/lib/api/alumni";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const getDepartmentColor = (type: string) => {
  const colors = [
    "from-emerald-500 to-green-600",
    "from-blue-500 to-cyan-600",
    "from-amber-500 to-orange-600",
  ];
  const index = type.charCodeAt(0) % colors.length;
  return colors[index];
};

const EventCardSkeleton = () => (
  <Card className="border border-slate-200">
    <CardContent className="p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-10" />
      </div>
    </CardContent>
  </Card>
);

export default function AlumniEvents() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialLimit = parseInt(searchParams.get("limit") || "6", 10);
  const initialType = searchParams.get("type") || "all";
  const initialCategory = searchParams.get("category") || "all";
  const initialMyEvents = searchParams.get("myEvents") === "true";
  const initialSearch = searchParams.get("search") || "";

  // State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [myEventsOnly, setMyEventsOnly] = useState(initialMyEvents);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageLimit] = useState(initialLimit);

  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<{
    totalEvents: number;
    upcomingEvents: number;
    myEvents: number;
  }>({ totalEvents: 0, upcomingEvents: 0, myEvents: 0 });
  const [pagination, setPagination] = useState<{
    totalCount: number;
    totalPages: number;
    limit: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { stats: eventStats } = await eventsApi.getStats();
        setStats(eventStats);
      } catch (error) {
        console.error("Failed to fetch event stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: pageLimit,
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (selectedType !== "all") params.type = selectedType;
        if (selectedCategory !== "all") params.category = selectedCategory;
        if (myEventsOnly) params.myEvents = "true";

        const { events: eventList, pagination: paginationData } =
          await eventsApi.getAll(params);
        setEvents(eventList);
        setPagination(paginationData);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
        setPagination(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, [
    debouncedSearch,
    selectedType,
    selectedCategory,
    myEventsOnly,
    currentPage,
    pageLimit,
  ]);

  // Update URL params
  const updateUrlParams = useCallback(
    (params: Record<string, string | number>) => {
      const newParams = new URLSearchParams();

      // Always include page and limit
      newParams.set("page", params.page?.toString() || "1");
      newParams.set("limit", params.limit?.toString() || "6");

      // Add filter params
      if (params.type && params.type !== "all") {
        newParams.set("type", params.type.toString());
      }
      if (params.category && params.category !== "all") {
        newParams.set("category", params.category.toString());
      }
      if (params.myEvents === "true") {
        newParams.set("myEvents", "true");
      }
      if (params.search && params.search !== "") {
        newParams.set("search", params.search.toString());
      }

      router.push(`?${newParams.toString()}`, { scroll: false });
    },
    [router],
  );

  // Sync URL params
  useEffect(() => {
    updateUrlParams({
      page: currentPage,
      limit: pageLimit,
      type: selectedType,
      category: selectedCategory,
      myEvents: myEventsOnly ? "true" : "false",
      search: searchTerm,
    });
  }, [
    searchTerm,
    selectedType,
    selectedCategory,
    myEventsOnly,
    currentPage,
    pageLimit,
    updateUrlParams,
  ]);

  const handleRegister = async (
    eventId: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await eventsApi.toggleRegistration(eventId);
      // Refresh events
      const params: any = {
        page: currentPage,
        limit: pageLimit,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedType !== "all") params.type = selectedType;
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (myEventsOnly) params.myEvents = "true";

      const { events: eventList, pagination: paginationData } =
        await eventsApi.getAll(params);
      setEvents(eventList);
      setPagination(paginationData);

      // Refresh stats
      const { stats: eventStats } = await eventsApi.getStats();
      setStats(eventStats);

      // Update selected event if in modal
      if (selectedEvent && selectedEvent.id === eventId) {
        const { event } = await eventsApi.getOne(eventId);
        setSelectedEvent(event);
      }
    } catch (error) {
      console.error("Failed to toggle registration:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("all");
    setSelectedCategory("all");
    setMyEventsOnly(false);
    setCurrentPage(1);
  };

  // Get unique values for filters
  const eventTypes = [...new Set(events.map((e) => e.type))].sort();
  const categories = [...new Set(events.map((e) => e.category))].sort();

  // Calendar events
  const calendarEvents = events
    .filter((e) => (myEventsOnly ? e.isRegistered : true))
    .map((event) => ({
      title: event.title,
      start: new Date(event.eventDate),
      end: new Date(event.eventDate),
      resource: event,
    }));

  const EventCard = ({ event }: { event: Event }) => {
    const isOnline = event.isVirtual;
    const isPaid = event.isPaid;

    return (
      <Card className="hover:shadow-lg transition-all duration-300 border border-slate-200 h-full flex flex-col">
        <CardContent className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Link href={`/events/${event.id}`}>
                <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600 line-clamp-1 cursor-pointer">
                  {event.title}
                </h3>
              </Link>
              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                  {event.startTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      {event.startTime}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1 line-clamp-1">
                    <MapPin className="h-4 w-4 text-orange-500 flex-shrink-0" />
                    {event.location || "TBA"}
                  </span>
                </div>
                {event.duration && (
                  <div className="text-sm text-gray-600">
                    Duration: {event.duration}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-amber-500" />
                    {event.attendees}
                    {event.maxAttendees ? `/${event.maxAttendees}` : ""}{" "}
                    attending
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 items-end ml-4">
              <div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border bg-gradient-to-br ${getDepartmentColor(
                  event.type,
                )} text-white`}
              >
                {event.type}
              </div>
              {isOnline && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-200"
                >
                  <Video className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              )}
              {!isOnline && (
                <Badge
                  variant="outline"
                  className="text-gray-600 border-gray-200"
                >
                  In-person
                </Badge>
              )}
              {isPaid && (
                <span className="text-sm font-medium text-green-600">
                  {event.currency} {event.price}
                </span>
              )}
              {!isPaid && (
                <span className="text-sm font-medium text-gray-600">Free</span>
              )}
            </div>
          </div>

          <div className="mt-auto pt-3 border-t space-y-3">
            <div className="text-xs text-gray-500">
              Organized by {event.organizer}
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={event.isRegistered ? "outline" : "default"}
                disabled={
                  event.maxAttendees
                    ? event.attendees >= event.maxAttendees &&
                      !event.isRegistered
                    : false
                }
                onClick={(e) => handleRegister(event.id, e)}
              >
                {event.isRegistered
                  ? "Cancel Registration"
                  : event.maxAttendees && event.attendees >= event.maxAttendees
                    ? "Full"
                    : "Register"}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-blue-secondary bg-clip-text text-transparent">
            Alumni Events
          </h1>
          <p className="text-gray-600">
            Discover and join amazing events in our community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCalendar(true)}
            className="border-blue-secondary text-blue-secondary hover:bg-blue-secondary hover:text-white"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            My Calendar
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-green-primary to-green-secondary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-100">
              Total Events
            </CardTitle>
            <Calendar className="h-5 w-5 text-emerald-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs text-emerald-100">Available events</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-secondary to-blue-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">
              Upcoming Events
            </CardTitle>
            <Clock className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-blue-100">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-primary to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-100">
              My Events
            </CardTitle>
            <Users className="h-5 w-5 text-amber-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myEvents}</div>
            <p className="text-xs text-amber-100">Registered events</p>
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
                placeholder="Search events by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Event Type" />
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

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
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

              <Button
                variant={myEventsOnly ? "default" : "outline"}
                onClick={() => setMyEventsOnly(!myEventsOnly)}
                className={`justify-start ${
                  myEventsOnly
                    ? "bg-orange-primary hover:bg-orange-600"
                    : "border-orange-primary text-orange-primary hover:bg-orange-primary hover:text-white"
                }`}
              >
                <Users className="h-4 w-4 mr-2" />
                My Events
              </Button>

              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white col-span-2"
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
          {pagination
            ? `Showing ${
                pagination.totalCount > 0
                  ? (currentPage - 1) * pagination.limit + 1
                  : 0
              }-${Math.min(
                currentPage * pagination.limit,
                pagination.totalCount,
              )} of ${pagination.totalCount} events`
            : "Showing 0-0 of 0 events"}
        </p>
      </div>

      {/* Event Cards */}
      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clearing filters
            </p>
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="border-green-primary text-green-primary hover:bg-green-primary hover:text-white"
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(pagination.totalPages, prev + 1),
              )
            }
            disabled={currentPage === pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Calendar Modal */}
      <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Calendar</DialogTitle>
          </DialogHeader>
          <div className="h-[600px]">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              onSelectEvent={async (event: any) => {
                try {
                  const { event: eventDetail } = await eventsApi.getOne(
                    event.resource.id,
                  );
                  setSelectedEvent(eventDetail);
                } catch (error) {
                  console.error("Failed to fetch event details:", error);
                }
              }}
              eventPropGetter={(event: any) => ({
                style: {
                  backgroundColor: event.resource.isRegistered
                    ? "#10b981"
                    : "#3b82f6",
                },
              })}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Detail Modal */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-700">{selectedEvent.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    {new Date(selectedEvent.eventDate).toLocaleDateString()}
                  </div>
                  {selectedEvent.startTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      {selectedEvent.startTime}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-orange-500" />
                    {selectedEvent.location || "TBA"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-amber-500" />
                    {selectedEvent.attendees} attending
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1"
                    variant={selectedEvent.isRegistered ? "outline" : "default"}
                    onClick={(e) => handleRegister(selectedEvent.id, e)}
                  >
                    {selectedEvent.isRegistered
                      ? "Cancel Registration"
                      : "Register"}
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
