import { Request, Response } from "express";
import { db } from "../db/client";
import { alumni_events, event_registrations } from "../db/schema";
import { users } from "../db/schema";
import { eq, and, or, ilike, sql, desc, asc, count, gte, lte } from "drizzle-orm";
import { Logger } from "../config";

const logger = new Logger("EventsController");

// Default event types
const EVENT_TYPES = [
  "Career",
  "Networking",
  "Workshop",
  "Social",
  "Webinar",
  "Conference",
  "Mentorship",
  "Training",
];

// Default event categories
const EVENT_CATEGORIES = [
  "Professional Development",
  "Education",
  "Social",
  "Community Service",
  "Fundraising",
  "Alumni Reunion",
];

/**
 * Get events statistics
 */
export const getEventStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Total events
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_events)
      .where(eq(alumni_events.status, "Open"));

    // Upcoming events (events in the future)
    const upcomingResult = await db
      .select({ count: count() })
      .from(alumni_events)
      .where(
        and(
          eq(alumni_events.status, "Open"),
          gte(alumni_events.event_date, new Date())
        )
      );

    // User's registered events
    let myEvents = 0;
    if (req.user) {
      const myEventsResult = await db
        .select({ count: count() })
        .from(event_registrations)
        .where(
          and(
            eq(event_registrations.user_id, parseInt(req.user.id, 10)),
            eq(event_registrations.status, "Registered")
          )
        );
      myEvents = myEventsResult[0]?.count || 0;
    }

    res.status(200).json({
      stats: {
        totalEvents: totalResult[0]?.count || 0,
        upcomingEvents: upcomingResult[0]?.count || 0,
        myEvents,
      },
    });
  } catch (error) {
    logger.error("Error fetching event stats", error);
    res.status(500).json({
      error: "Failed to fetch event statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all events with pagination and filters
 */
export const getAllEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, search, type, category, status, myEvents, startDate, endDate } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];

    // Search
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(alumni_events.title, `%${search}%`),
          ilike(alumni_events.description, `%${search}%`),
          ilike(alumni_events.organizer, `%${search}%`)
        )
      );
    }

    // Type filter
    if (type && type !== "all") {
      conditions.push(eq(alumni_events.type, type as string));
    }

    // Category filter
    if (category && category !== "all") {
      conditions.push(eq(alumni_events.category, category as string));
    }

    // Status filter
    if (status && status !== "all") {
      conditions.push(eq(alumni_events.status, status as string));
    }

    // Date range filters
    if (startDate) {
      conditions.push(gte(alumni_events.event_date, new Date(startDate as string)));
    }
    if (endDate) {
      conditions.push(lte(alumni_events.event_date, new Date(endDate as string)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // If myEvents filter is enabled, we need to join with registrations
    let query;
    if (myEvents === "true" && req.user) {
      const userId = parseInt(req.user.id, 10);

      // Get event IDs user is registered for
      const userRegistrations = await db
        .select({ eventId: event_registrations.event_id })
        .from(event_registrations)
        .where(
          and(
            eq(event_registrations.user_id, userId),
            eq(event_registrations.status, "Registered")
          )
        );

      const eventIds = userRegistrations.map(r => r.eventId);

      if (eventIds.length > 0) {
        conditions.push(
          sql`${alumni_events.id} IN (${sql.join(eventIds.map(id => sql`${id}`), sql`, `)})`
        );
      } else {
        // User has no registered events, return empty
        return res.status(200).json({
          events: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount: 0,
            totalPages: 0,
            hasMore: false,
          },
          filters: {
            types: EVENT_TYPES,
            categories: EVENT_CATEGORIES,
          },
        });
      }
    }

    const finalWhereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(alumni_events)
      .where(finalWhereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Get events
    query = db
      .select({
        id: alumni_events.id,
        title: alumni_events.title,
        description: alumni_events.description,
        eventDate: alumni_events.event_date,
        startTime: alumni_events.start_time,
        endTime: alumni_events.end_time,
        duration: alumni_events.duration,
        location: alumni_events.location,
        isVirtual: alumni_events.is_virtual,
        meetingUrl: alumni_events.meeting_url,
        type: alumni_events.type,
        category: alumni_events.category,
        organizer: alumni_events.organizer,
        organizerId: alumni_events.organizer_id,
        maxAttendees: alumni_events.max_attendees,
        isPaid: alumni_events.is_paid,
        price: alumni_events.price,
        currency: alumni_events.currency,
        status: alumni_events.status,
        imageUrl: alumni_events.image_url,
        speakers: alumni_events.speakers,
        agenda: alumni_events.agenda,
        tags: alumni_events.tags,
        views: alumni_events.views,
        createdAt: alumni_events.created_at,
      })
      .from(alumni_events);

    if (finalWhereClause) {
      query = query.where(finalWhereClause) as any;
    }

    // Default sort: upcoming events first
    query = query.orderBy(asc(alumni_events.event_date)) as any;

    const events = await query.limit(limitNum).offset(offset);

    // Get attendee counts and registration status for each event
    const eventIds = events.map((e) => e.id);
    let attendeeCounts: Record<number, number> = {};
    let registrationStatus: Record<number, boolean> = {};

    if (eventIds.length > 0) {
      // Get attendee counts
      const countsResult = await db
        .select({
          eventId: event_registrations.event_id,
          count: count(),
        })
        .from(event_registrations)
        .where(
          and(
            sql`${event_registrations.event_id} IN (${sql.join(eventIds.map((id) => sql`${id}`), sql`, `)})`,
            eq(event_registrations.status, "Registered")
          )
        )
        .groupBy(event_registrations.event_id);

      countsResult.forEach((r) => {
        attendeeCounts[r.eventId] = r.count;
      });

      // Get user's registration status if authenticated
      if (req.user) {
        const userId = parseInt(req.user.id, 10);
        const userRegs = await db
          .select({ eventId: event_registrations.event_id })
          .from(event_registrations)
          .where(
            and(
              sql`${event_registrations.event_id} IN (${sql.join(eventIds.map((id) => sql`${id}`), sql`, `)})`,
              eq(event_registrations.user_id, userId),
              eq(event_registrations.status, "Registered")
            )
          );

        userRegs.forEach((r) => {
          registrationStatus[r.eventId] = true;
        });
      }
    }

    // Get unique values for filters
    const allEvents = await db
      .select({
        type: alumni_events.type,
        category: alumni_events.category,
      })
      .from(alumni_events);

    const types = [...new Set(allEvents.map((e) => e.type).filter(Boolean))].sort();
    const categories = [...new Set(allEvents.map((e) => e.category).filter(Boolean))].sort();

    res.status(200).json({
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        startTime: e.startTime,
        endTime: e.endTime,
        duration: e.duration,
        location: e.location,
        isVirtual: e.isVirtual,
        meetingUrl: e.meetingUrl,
        type: e.type,
        category: e.category,
        organizer: e.organizer,
        organizerId: e.organizerId,
        maxAttendees: e.maxAttendees,
        isPaid: e.isPaid,
        price: e.price,
        currency: e.currency,
        status: e.status,
        imageUrl: e.imageUrl,
        speakers: e.speakers,
        agenda: e.agenda,
        tags: e.tags,
        views: e.views || 0,
        attendees: attendeeCounts[e.id] || 0,
        isRegistered: registrationStatus[e.id] || false,
        createdAt: e.createdAt,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        types: [...new Set([...EVENT_TYPES, ...types])],
        categories: [...new Set([...EVENT_CATEGORIES, ...categories])],
      },
    });
  } catch (error) {
    logger.error("Error fetching events", error);
    res.status(500).json({
      error: "Failed to fetch events",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single event
 */
export const getEvent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const eventId = parseInt(req.params.id, 10);

    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    const event = await db
      .select()
      .from(alumni_events)
      .where(eq(alumni_events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    // Increment view count
    await db
      .update(alumni_events)
      .set({ views: (event[0].views || 0) + 1 })
      .where(eq(alumni_events.id, eventId));

    // Get attendee count
    const attendeeResult = await db
      .select({ count: count() })
      .from(event_registrations)
      .where(
        and(
          eq(event_registrations.event_id, eventId),
          eq(event_registrations.status, "Registered")
        )
      );

    const attendees = attendeeResult[0]?.count || 0;

    // Check if user is registered
    let isRegistered = false;
    if (req.user) {
      const regCheck = await db
        .select({ id: event_registrations.id })
        .from(event_registrations)
        .where(
          and(
            eq(event_registrations.event_id, eventId),
            eq(event_registrations.user_id, parseInt(req.user.id, 10)),
            eq(event_registrations.status, "Registered")
          )
        )
        .limit(1);
      isRegistered = regCheck.length > 0;
    }

    const e = event[0];
    res.status(200).json({
      event: {
        id: e.id,
        title: e.title,
        description: e.description,
        eventDate: e.event_date,
        startTime: e.start_time,
        endTime: e.end_time,
        duration: e.duration,
        location: e.location,
        isVirtual: e.is_virtual,
        meetingUrl: e.meeting_url,
        type: e.type,
        category: e.category,
        organizer: e.organizer,
        organizerId: e.organizer_id,
        maxAttendees: e.max_attendees,
        isPaid: e.is_paid,
        price: e.price,
        currency: e.currency,
        status: e.status,
        imageUrl: e.image_url,
        speakers: e.speakers,
        agenda: e.agenda,
        tags: e.tags,
        views: (e.views || 0) + 1,
        attendees,
        isRegistered,
        createdAt: e.created_at,
        updatedAt: e.updated_at,
      },
    });
  } catch (error) {
    logger.error("Error fetching event", error);
    res.status(500).json({
      error: "Failed to fetch event",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Register/Unregister for an event
 */
export const toggleRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const eventId = parseInt(req.params.id, 10);
    const userId = parseInt(req.user.id, 10);

    if (isNaN(eventId)) {
      res.status(400).json({ error: "Invalid event ID" });
      return;
    }

    // Check if event exists and is open
    const event = await db
      .select()
      .from(alumni_events)
      .where(eq(alumni_events.id, eventId))
      .limit(1);

    if (event.length === 0) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    if (event[0].status !== "Open") {
      res.status(400).json({ error: "Event is not open for registration" });
      return;
    }

    // Check if user is already registered
    const existingReg = await db
      .select()
      .from(event_registrations)
      .where(
        and(
          eq(event_registrations.event_id, eventId),
          eq(event_registrations.user_id, userId)
        )
      )
      .limit(1);

    let registered: boolean;
    if (existingReg.length > 0) {
      // Toggle status
      if (existingReg[0].status === "Registered") {
        // Cancel registration
        await db
          .update(event_registrations)
          .set({ status: "Cancelled" })
          .where(eq(event_registrations.id, existingReg[0].id));
        registered = false;
      } else {
        // Re-register
        await db
          .update(event_registrations)
          .set({ status: "Registered" })
          .where(eq(event_registrations.id, existingReg[0].id));
        registered = true;
      }
    } else {
      // Check capacity
      if (event[0].max_attendees) {
        const attendeeCount = await db
          .select({ count: count() })
          .from(event_registrations)
          .where(
            and(
              eq(event_registrations.event_id, eventId),
              eq(event_registrations.status, "Registered")
            )
          );

        if ((attendeeCount[0]?.count || 0) >= event[0].max_attendees) {
          res.status(400).json({ error: "Event is full" });
          return;
        }
      }

      // Register
      await db.insert(event_registrations).values({
        event_id: eventId,
        user_id: userId,
        status: "Registered",
      });
      registered = true;
    }

    // Get updated attendee count
    const attendeeResult = await db
      .select({ count: count() })
      .from(event_registrations)
      .where(
        and(
          eq(event_registrations.event_id, eventId),
          eq(event_registrations.status, "Registered")
        )
      );

    res.status(200).json({
      registered,
      attendees: attendeeResult[0]?.count || 0,
      message: registered
        ? "Successfully registered for event"
        : "Registration cancelled",
    });
  } catch (error) {
    logger.error("Error toggling registration", error);
    res.status(500).json({
      error: "Failed to process registration",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
