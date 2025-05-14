"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const logger = new config_1.Logger("Server");
const PORT = config_1.env.API_PORT || 3002;
// Start the server
const server = app_1.default.listen(PORT, () => {
    logger.info(`Server running in ${config_1.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`API Documentation available at ${config_1.env.NODE_ENV === "production"
        ? "https://backend-cbx8.onrender.com/api/docs"
        : `http://localhost:${PORT}/api/docs`}`);
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Promise Rejection:", err);
    // In production, we would alert DevOps team
    // Gracefully shutdown the server
    server.close(() => {
        logger.error("Server closed due to unhandled promise rejection");
        process.exit(1);
    });
});
// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception:", err);
    // In production, we would alert DevOps team
    // Gracefully shutdown the server
    server.close(() => {
        logger.error("Server closed due to uncaught exception");
        process.exit(1);
    });
});
// Listen for SIGTERM signal
process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");
    server.close(() => {
        logger.info("Process terminated");
    });
});
