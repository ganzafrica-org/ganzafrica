"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Video,
  ArrowLeft,
  Building,
  DollarSign,
  Eye,
  Globe,
} from "lucide-react";
import { eventsApi, type EventDetail } from "@/lib/api/alumni";

const getDepartmentColor = (type: string) => {
  const colors = [
    "from-emerald-500 to-green-600",
    "from-blue-500 to-cyan-600",
    "from-amber-500 to-orange-600",
  ];
  const index = type.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      setIsLoading(true);
      try {
        const { event: eventData } = await eventsApi.getOne(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    if (!event) return;

    setIsRegistering(true);
    try {
      await eventsApi.toggleRegistration(event.id);
      // Refresh event data
      const { event: eventData } = await eventsApi.getOne(event.id);
      setEvent(eventData);
    } catch (error) {
      console.error("Failed to toggle registration:", error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
        <Button variant="ghost" onClick={() => router.push("/events")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Event not found</h3>
            <p className="text-gray-600">
              The event you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOnline = event.isVirtual;
  const isPaid = event.isPaid;
  const attendeePercentage = event.maxAttendees
    ? Math.round((event.attendees / event.maxAttendees) * 100)
    : 0;
  const isFull = event.maxAttendees ? event.attendees >= event.maxAttendees : false;

  return (
    <div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push("/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
        <div className="flex gap-2">
          <Button
            onClick={handleRegister}
            disabled={isRegistering || (isFull && !event.isRegistered)}
            className={
              event.isRegistered
                ? "bg-orange-primary hover:bg-orange-600"
                : "bg-green-primary hover:bg-green-600"
            }
          >
            {isRegistering
              ? "Processing..."
              : event.isRegistered
                ? "Cancel Registration"
                : isFull
                  ? "Event Full"
                  : "Register for Event"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Event Header Card */}
      <Card className="shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border bg-gradient-to-br ${getDepartmentColor(event.type)} text-white`}
                >
                  {event.type}
                </div>
                <Badge variant="outline" className="text-sm">
                  {event.category}
                </Badge>
                {event.isRegistered && (
                  <Badge className="bg-green-primary text-sm">✓ Registered</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{event.title}</h1>
              <p className="text-gray-700 text-lg leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="h-5 w-5" />
                <span className="font-medium">Date</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {new Date(event.eventDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="bg-emerald-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-medium">Time</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {event.startTime || "TBA"}
                {event.endTime && ` - ${event.endTime}`}
              </p>
              {event.duration && (
                <p className="text-sm text-gray-600 mt-1">Duration: {event.duration}</p>
              )}
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                {isOnline ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                <span className="font-medium">Location</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {isOnline ? "Virtual Event" : event.location || "TBA"}
              </p>
              {isOnline && event.meetingUrl && event.isRegistered && (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
                >
                  <Globe className="h-3 w-3" />
                  Join Meeting
                </a>
              )}
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Users className="h-5 w-5" />
                <span className="font-medium">Attendees</span>
              </div>
              <p className="text-gray-900 font-semibold">
                {event.attendees}
                {event.maxAttendees ? `/${event.maxAttendees}` : ""} registered
              </p>
              {event.maxAttendees && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{ width: `${attendeePercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{attendeePercentage}% full</p>
                </div>
              )}
            </div>
          </div>

          {/* Organizer and Price */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Organized by</p>
                <p className="font-medium text-gray-900">{event.organizer}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium text-gray-900">
                  {isPaid ? `${event.currency} ${event.price}` : "Free"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speakers */}
      {event.speakers && event.speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {event.speakers.map((speaker: any, index: number) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{speaker.name}</h4>
                  <p className="text-sm text-gray-700">{speaker.title}</p>
                  {speaker.company && (
                    <p className="text-sm text-gray-600 mt-1">{speaker.company}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agenda */}
      {event.agenda && event.agenda.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Event Agenda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {event.agenda.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 pb-3 border-b last:border-0">
                  <div className="flex-shrink-0 w-24 font-medium text-blue-600">{item.time}</div>
                  <div className="flex-1 text-gray-700">{item.activity}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Views */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Eye className="h-4 w-4" />
        <span>{event.views} views</span>
      </div>
    </div>
  );
}
