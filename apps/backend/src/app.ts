import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { errorHandler } from './middleware/error';
import notificationRoutes from './routes/notification.routes';
import contactRoutes from './routes/contact.routes';
import { WebSocketService } from './services/websocket.service';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/contacts', contactRoutes);

// Error handling
app.use(errorHandler);

// Create HTTP server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // Initialize WebSocket server
  WebSocketService.initialize(server);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app; 