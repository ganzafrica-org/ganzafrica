import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "express-async-errors";
import swaggerUi from "swagger-ui-express";
import swaggerSpecs from "./swagger/specs";
import { env, Logger, constants } from "./config";
import { checkDatabaseConnection } from "./db/client";
import { errorHandler, notFoundHandler } from "./middlewares";
import { csrfProtection } from "./middlewares/csrf.middleware";
import path from "path";

// Import routes - corrected to match your existing import
import apiRoutes from "./routes";

// Setup logger
const logger = new Logger("App");

// Initialize Express app
const app: Express = express();

// Configure middleware
// Behind a reverse proxy (e.g., Nginx/DO App Platform) so protocol reflects x-forwarded-proto
app.set("trust proxy", 1);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser(env.SESSION_SECRET)); // For parsing cookies

// Note: Static files are served from Digital Ocean Spaces

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; connect-src 'self' https://*.onrender.com:* https://*.onrender.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; object-src 'self'; font-src 'self' data:;",
  );
  next();
});

// CORS configuration
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? env.CORS_ORIGINS : true, // Allow all origins in development
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

// Security headers
app.use(helmet());

// Request logging
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting - DISABLED to allow unlimited requests
// app.use(
//     rateLimit({
//         windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes
//         limit: env.RATE_LIMIT_MAX, // 100 requests per window
//         standardHeaders: true,
//         legacyHeaders: false,
//         message: { error: "Too many requests, please try again later." },
//         skip: (req) => req.ip === "127.0.0.1" && env.NODE_ENV === "development",
//     }),
// );

// API health check route
app.get("/api/health", async (req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus ? "connected" : "disconnected",
  });
});

// API documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// CSRF (double-submit) on all API routes; entry-point routes are exempted inside the middleware.
app.use("/api", csrfProtection);

// API routes
app.use("/api", apiRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Files are now served from Digital Ocean Spaces
logger.info("File uploads configured to use Digital Ocean Spaces");

export default app;
