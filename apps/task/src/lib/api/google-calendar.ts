import apiClient from '../api-client';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink?: string;
}

export interface GoogleCalendarAuthUrlResponse {
  success: boolean;
  authUrl: string;
}

export interface GoogleCalendarStatusResponse {
  success: boolean;
  connected: boolean;
  connectedUserIds?: string[]; // For multi-user status checks
}

export interface GoogleCalendarEventsResponse {
  success: boolean;
  events: GoogleCalendarEvent[];
}

export interface GoogleCalendarDisconnectResponse {
  success: boolean;
  message: string;
}

export const googleCalendarApi = {
  /**
   * Get Google Calendar OAuth URL
   */
  getAuthUrl: async (): Promise<GoogleCalendarAuthUrlResponse> => {
    const response = await apiClient.get('/google-calendar/auth-url');
    return response.data;
  },

  /**
   * Check Google Calendar connection status
   * @param userIds - Optional array of user IDs to check status for (for managers viewing multiple users)
   */
  getConnectionStatus: async (userIds?: string[]): Promise<GoogleCalendarStatusResponse> => {
    const params: any = {};
    if (userIds && userIds.length > 0) {
      params.userIds = userIds.join(',');
    }
    const response = await apiClient.get('/google-calendar/status', { params });
    return response.data;
  },

  /**
   * Get Google Calendar events for a date range
   * @param timeMin - Start time (ISO string)
   * @param timeMax - End time (ISO string)
   * @param userIds - Optional array of user IDs to fetch events for (for managers viewing multiple users)
   */
  getEvents: async (
    timeMin: string,
    timeMax: string,
    userIds?: string[]
  ): Promise<GoogleCalendarEventsResponse> => {
    const params: any = {
      timeMin,
      timeMax,
    };
    
    if (userIds && userIds.length > 0) {
      params.userIds = userIds.join(',');
    }
    
    const response = await apiClient.get('/google-calendar/events', { params });
    return response.data;
  },

  /**
   * Disconnect Google Calendar
   */
  disconnect: async (): Promise<GoogleCalendarDisconnectResponse> => {
    const response = await apiClient.post('/google-calendar/disconnect');
    return response.data;
  },
};

