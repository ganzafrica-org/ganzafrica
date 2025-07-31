import WebSocket from 'ws';
import { Server } from 'http';
import { verifyToken } from '../utils/auth';
import { Notification } from '../models/notification.model';

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive: boolean;
}

export class WebSocketService {
  private static wss: WebSocket.Server;
  private static clients: Map<number, Set<WebSocketClient>> = new Map();

  static initialize(server: Server) {
    this.wss = new WebSocket.Server({ server, path: '/ws/notifications' });

    this.wss.on('connection', async (ws: WebSocketClient, req) => {
      try {
        // Get token from query string
        const url = new URL(req.url || '', `http://${req.headers.host}`);
        const token = url.searchParams.get('token');

        if (!token) {
          ws.close(1008, 'Token required');
          return;
        }

        // Verify token and get user ID
        const decoded = await verifyToken(token);
        if (!decoded || !decoded.id) {
          ws.close(1008, 'Invalid token');
          return;
        }

        // Store user ID in WebSocket connection
        ws.userId = decoded.id;
        ws.isAlive = true;

        // Add client to user's connections
        if (!this.clients.has(decoded.id)) {
          this.clients.set(decoded.id, new Set());
        }
        this.clients.get(decoded.id)?.add(ws);

        // Set up ping-pong for connection health check
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle client disconnect
        ws.on('close', () => {
          if (ws.userId) {
            this.clients.get(ws.userId)?.delete(ws);
            if (this.clients.get(ws.userId)?.size === 0) {
              this.clients.delete(ws.userId);
            }
          }
        });

        // Handle errors
        ws.on('error', (error) => {
          console.error('WebSocket error:', error);
          ws.close();
        });

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1011, 'Internal server error');
      }
    });

    // Set up periodic health check
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  static sendNotification(userId: number, notification: Notification) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify(notification);
    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  static broadcastNotification(notification: Notification, excludeUserId?: number) {
    const message = JSON.stringify(notification);
    this.wss.clients.forEach((client: WebSocketClient) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.userId !== excludeUserId
      ) {
        client.send(message);
      }
    });
  }
} 