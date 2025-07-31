import { jwtDecode } from 'jwt-decode';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: string;
  priority: 'normal' | 'high';
  createdAt: string;
}

class NotificationService {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private wsSubscribers: ((notification: Notification) => void)[] = [];

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Initialize WebSocket connection
  public initializeWebSocket() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000'}/ws/notifications?token=${token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        this.wsSubscribers.forEach(callback => callback(notification));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      // Attempt to reconnect after 5 seconds
      setTimeout(() => this.initializeWebSocket(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Subscribe to real-time notifications
  public subscribe(callback: (notification: Notification) => void) {
    this.wsSubscribers.push(callback);
    return () => {
      this.wsSubscribers = this.wsSubscribers.filter(cb => cb !== callback);
    };
  }

  // Fetch notifications with pagination
  public async getNotifications(page: number = 1, limit: number = 10): Promise<{
    notifications: Notification[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/notifications?page=${page}&limit=${limit}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Get unread notifications count
  public async getUnreadCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/unread-count`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Mark notification as read
  public async markAsRead(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  public async deleteNotification(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  public async markAllAsRead(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const notificationService = new NotificationService(); 