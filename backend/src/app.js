"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = require("express-rate-limit");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
require("express-async-errors");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const specs_1 = __importDefault(require("./swagger/specs"));
const config_1 = require("./config");
const client_1 = require("./db/client");
const middlewares_1 = require("./middlewares");
const path_1 = __importDefault(require("path"));
// Import routes - corrected to match your existing import
const routes_1 = __importDefault(require("./routes"));
// Setup logger
const logger = new config_1.Logger("App");
// Initialize Express app
const app = (0, express_1.default)();
// Configure middleware
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
app.use((0, cookie_parser_1.default)(config_1.env.SESSION_SECRET)); // For parsing cookies
// IMPORTANT: Serve static files from uploads directory - MUST come before other middleware
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://*.onrender.com:* https://*.onrender.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; object-src 'self'; font-src 'self' data:;");
    next();
});
// CORS configuration
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
}));
// Security headers
app.use((0, helmet_1.default)());
// Request logging
app.use((0, morgan_1.default)(config_1.env.NODE_ENV === "production" ? "combined" : "dev"));
// Rate limiting
app.use((0, express_rate_limit_1.rateLimit)({
    windowMs: config_1.env.RATE_LIMIT_WINDOW_MS, // 15 minutes
    limit: config_1.env.RATE_LIMIT_MAX, // 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => req.ip === "127.0.0.1" && config_1.env.NODE_ENV === "development",
}));
// API health check route
app.get("/api/health", async (req, res) => {
    const dbStatus = await (0, client_1.checkDatabaseConnection)();
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: config_1.env.NODE_ENV,
        database: dbStatus ? "connected" : "disconnected",
    });
});
// API documentation
app.use("/api/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs_1.default));
// API routes
app.use("/api", routes_1.default);
// Handle 404 errors
app.use(middlewares_1.notFoundHandler);
// Global error handler
app.use(middlewares_1.errorHandler);
// Log uploads directory path for debugging
logger.info(`Serving static files from: ${path_1.default.join(__dirname, '../uploads')}`);
exports.default = app;
