import { google } from 'googleapis';
import env from '../config/env';
import Logger from '../config/logger';
import { db } from '../db/client';
import { users, user_profiles } from '../db/schema';
import { eq } from 'drizzle-orm';

const logger = new Logger('GoogleCalendarService');

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CALENDAR_CLIENT_ID || undefined,
  env.GOOGLE_CALENDAR_CLIENT_SECRET || undefined,
  env.GOOGLE_CALENDAR_REDIRECT_URI || undefined
);

interface GoogleCalendarTokens {
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}

/**
 * Get Google Calendar OAuth URL
 */
export const getGoogleCalendarAuthUrl = (userId: string, userEmail?: string): string => {
  if (!env.GOOGLE_CALENDAR_CLIENT_ID || !env.GOOGLE_CALENDAR_REDIRECT_URI) {
    throw new Error('Google Calendar credentials not configured');
  }

  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];

  const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
  
  const authUrlOptions: any = {
    access_type: 'offline',
    scope: scopes,
    state,
  };

  // Pre-select the user's email if provided - this skips account selection
  if (userEmail) {
    authUrlOptions.login_hint = userEmail.toLowerCase().trim(); // Ensure email is normalized
    // Use 'consent' to ensure we get refresh token on first connection
    // With login_hint, Google will pre-select the account, user just needs to click "Allow"
    authUrlOptions.prompt = 'consent';
    // Include previously granted scopes to make it smoother
    authUrlOptions.include_granted_scopes = true;
  } else {
    // If no email, show account selection
    authUrlOptions.prompt = 'select_account consent';
  }
  
  return oauth2Client.generateAuthUrl(authUrlOptions);
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeGoogleCalendarCode = async (
  code: string,
  userId: string
): Promise<void> => {
  if (!env.GOOGLE_CALENDAR_CLIENT_ID || !env.GOOGLE_CALENDAR_CLIENT_SECRET) {
    throw new Error('Google Calendar credentials not configured');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get access and refresh tokens');
    }

    // Set credentials to get user info
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    // Get the Google account email address
    let googleEmail: string | null = null;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      googleEmail = userInfo.data.email?.toLowerCase().trim() || null;
      logger.info(`Google Calendar connected for user ${userId} with email: ${googleEmail}`);
    } catch (emailError) {
      logger.warn('Could not retrieve Google account email, will use primary calendar:', emailError);
      // Continue without email - will default to 'primary'
    }

    // Store tokens in user_profiles preferences (you may want to encrypt these)
    const userProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, parseInt(userId)),
    });

    const preferences = (userProfile?.preferences as Record<string, any>) || {};
    preferences.google_calendar = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date || null,
      google_email: googleEmail, // Store the Google account email
    };

    if (userProfile) {
      await db
        .update(user_profiles)
        .set({ preferences })
        .where(eq(user_profiles.user_id, parseInt(userId)));
    } else {
      await db.insert(user_profiles).values({
        user_id: parseInt(userId),
        preferences,
      });
    }
  } catch (error) {
    logger.error('Error exchanging Google Calendar code:', error);
    throw new Error('Failed to exchange authorization code');
  }
};

/**
 * Get user's Google Calendar tokens
 */
const getUserGoogleCalendarTokens = async (userId: string): Promise<GoogleCalendarTokens | null> => {
  const profile = await db.query.user_profiles.findFirst({
    where: eq(user_profiles.user_id, parseInt(userId)),
  });

  if (!profile?.preferences) {
    return null;
  }

  const preferences = profile.preferences as Record<string, any>;
  const googleCalendar = preferences.google_calendar;

  if (!googleCalendar?.access_token || !googleCalendar?.refresh_token) {
    return null;
  }

  return {
    access_token: googleCalendar.access_token,
    refresh_token: googleCalendar.refresh_token,
    expiry_date: googleCalendar.expiry_date || 0,
  };
};

/**
 * Refresh Google Calendar access token if needed
 */
const refreshGoogleCalendarToken = async (userId: string): Promise<string | null> => {
  const tokens = await getUserGoogleCalendarTokens(userId);
  
  if (!tokens) {
    return null;
  }

  oauth2Client.setCredentials({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: tokens.expiry_date,
  });

  // Check if token is expired or will expire soon (within 5 minutes)
  const now = Date.now();
  if (tokens.expiry_date && tokens.expiry_date > now + 5 * 60 * 1000) {
    // Token is still valid
    return tokens.access_token;
  }

  try {
    // Refresh the token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }

    // Update stored tokens
    const userProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, parseInt(userId)),
    });

    if (userProfile) {
      const preferences = (userProfile.preferences as Record<string, any>) || {};
      if (preferences.google_calendar) {
        preferences.google_calendar.access_token = credentials.access_token;
        preferences.google_calendar.expiry_date = credentials.expiry_date || null;
      }

      await db
        .update(user_profiles)
        .set({ preferences })
        .where(eq(user_profiles.user_id, parseInt(userId)));
    }

    return credentials.access_token;
  } catch (error) {
    logger.error('Error refreshing Google Calendar token:', error);
    return null;
  }
};

/**
 * Get authenticated Google Calendar client
 */
const getGoogleCalendarClient = async (userId: string) => {
  const accessToken = await refreshGoogleCalendarToken(userId);
  
  if (!accessToken) {
    throw new Error('Google Calendar not connected or token expired');
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

/**
 * Check if user has Google Calendar connected
 */
export const isGoogleCalendarConnected = async (userId: string): Promise<boolean> => {
  const tokens = await getUserGoogleCalendarTokens(userId);
  return tokens !== null;
};

/**
 * Check which users have Google Calendar connected
 */
export const getConnectedUserIds = async (userIds: string[]): Promise<string[]> => {
  const results = await Promise.all(
    userIds.map(async (userId) => {
      const connected = await isGoogleCalendarConnected(userId);
      return connected ? userId : null;
    })
  );
  
  return results.filter((id): id is string => id !== null);
};

/**
 * Get Google Calendar events for a date range
 */
export const getGoogleCalendarEvents = async (
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<any[]> => {
  try {
    logger.info(`Fetching Google Calendar events for user ${userId}`, {
      timeMin,
      timeMax
    });
    
    // Get the stored Google account email for this user
    const profile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, parseInt(userId)),
    });

    let calendarId = 'primary'; // Default to primary calendar
    if (profile?.preferences) {
      const preferences = profile.preferences as Record<string, any>;
      const googleCalendar = preferences.google_calendar;
      if (googleCalendar?.google_email) {
        calendarId = googleCalendar.google_email;
        logger.info(`Using calendar ID (email): ${calendarId} for user ${userId}`);
      }
    }
    
    const calendar = await getGoogleCalendarClient(userId);
    
    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    logger.info(`Retrieved ${events.length} Google Calendar events for user ${userId}`);
    
    if (events.length > 0) {
      logger.debug('Sample event:', {
        id: events[0].id,
        summary: events[0].summary,
        start: events[0].start,
        end: events[0].end
      });
    }

    // Add userId to each event for filtering
    return events.map(event => ({
      ...event,
      userId: userId
    }));
  } catch (error) {
    logger.error('Error fetching Google Calendar events:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error details:', errorMessage);
    throw new Error(`Failed to fetch Google Calendar events: ${errorMessage}`);
  }
};

/**
 * Get Google Calendar events for multiple users
 */
export const getGoogleCalendarEventsForUsers = async (
  userIds: string[],
  timeMin: string,
  timeMax: string
): Promise<Array<{ userId: string; events: any[] }>> => {
  const results = await Promise.allSettled(
    userIds.map(async (userId) => {
      try {
        const events = await getGoogleCalendarEvents(userId, timeMin, timeMax);
        return { userId, events };
      } catch (error) {
        logger.warn(`Failed to fetch events for user ${userId}:`, error);
        return { userId, events: [] };
      }
    })
  );

  return results
    .filter((result): result is PromiseFulfilledResult<{ userId: string; events: any[] }> => result.status === 'fulfilled')
    .map(result => result.value);
};

/**
 * Disconnect Google Calendar
 */
export const disconnectGoogleCalendar = async (userId: string): Promise<void> => {
  try {
    const userProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, parseInt(userId)),
    });

    if (userProfile) {
      const preferences = (userProfile.preferences as Record<string, any>) || {};
      delete preferences.google_calendar;

      await db
        .update(user_profiles)
        .set({ preferences })
        .where(eq(user_profiles.user_id, parseInt(userId)));
    }
  } catch (error) {
    logger.error('Error disconnecting Google Calendar:', error);
    throw new Error('Failed to disconnect Google Calendar');
  }
};

