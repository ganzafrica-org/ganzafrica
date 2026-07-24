import axios from "axios";

export function parseApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message;
    return "An unexpected error occurred";
  }

  const data = error.response?.data;

  // Handle nested data.message
  if (data?.message) {
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message[0];
  }

  // Handle validation error arrays (e.g., from some APIs)
  if (data?.errors && typeof data.errors === "object") {
    const firstErrorKey = Object.keys(data.errors)[0];
    const firstError = data.errors[firstErrorKey];
    if (Array.isArray(firstError)) return `${firstErrorKey}: ${firstError[0]}`;
    if (typeof firstError === "string") return `${firstErrorKey}: ${firstError}`;
  }

  return error.message || "An error occurred during the request";
}

export class AppApiError extends Error {
  status?: number;
  details?: any;

  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = "AppApiError";
    this.status = status;
    this.details = details;
  }
}

export function toAppApiError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return new AppApiError("Unexpected error occurred");
  }

  const status = error.response?.status;
  const payload = error.response?.data as any;

  return new AppApiError(parseApiError(error), status, payload?.details || payload?.errors);
}
