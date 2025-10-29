/**
 * Logging utility for production-ready logging
 * Handles different log levels and can be configured for production vs development
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

class Logger {
  private config: LogConfig = {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    enableConsole: true,
    enableRemote: false,
  };

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return `${prefix} ${message}`;
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug') && this.config.enableConsole) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info') && this.config.enableConsole) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn') && this.config.enableConsole) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, error?: unknown, ...args: any[]): void {
    if (this.shouldLog('error') && this.config.enableConsole) {
      const errorDetails = this.formatError(error);
      console.error(this.formatMessage('error', message), errorDetails, ...args);
    }
  }

  private formatError(error: unknown): string | Error {
    if (error instanceof Error) {
      return error;
    }
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return new Error(error.message);
      }
      return new Error(JSON.stringify(error));
    }
    return new Error(String(error));
  }

  // Helper to safely get error message
  getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      if ('response' in error && typeof error.response === 'object' && error.response !== null) {
        const response = error.response as { data?: { message?: string }; status?: number };
        if (response.data?.message) {
          return response.data.message;
        }
        if (response.status) {
          return `Request failed with status ${response.status}`;
        }
      }
      return JSON.stringify(error);
    }
    return String(error);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default logger for convenience
export default logger;

