"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("./env"));
class Logger {
    context;
    constructor(context) {
        this.context = context;
    }
    log(level, message, meta) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            context: this.context,
            message,
            ...(meta ? { meta } : {}),
            environment: env_1.default.NODE_ENV,
        };
        // In production, we might want to use a proper logging service
        if (env_1.default.NODE_ENV === "production") {
            // Here we would integrate with a logging service like Winston, Pino, etc.
            console[level](JSON.stringify(logEntry));
        }
        else {
            // For development and testing, we use console with colors
            const colorize = (text, colorCode) => `\x1b[${colorCode}m${text}\x1b[0m`;
            const colorMap = {
                debug: 34, // blue
                info: 32, // green
                warn: 33, // yellow
                error: 31, // red
            };
            console[level](`${colorize(timestamp, 90)} [${colorize(level.toUpperCase(), colorMap[level])}] [${colorize(this.context, 36)}]: ${message}`, meta ? meta : "");
        }
    }
    debug(message, meta) {
        if (env_1.default.NODE_ENV !== "production") {
            this.log("debug", message, meta);
        }
    }
    info(message, meta) {
        this.log("info", message, meta);
    }
    warn(message, meta) {
        this.log("warn", message, meta);
    }
    error(message, meta) {
        this.log("error", message, meta);
    }
}
exports.default = Logger;
