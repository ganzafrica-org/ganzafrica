import { afterAll, afterEach, beforeAll, expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { server } from "@/tests/mocks/server";

// Extend vitest's own `expect` explicitly (the `/vitest` auto-register entrypoint can bind to a
// different expect instance under pnpm hoisting, leaving matchers like toBeInTheDocument missing).
expect.extend(matchers);

// Radix UI (Tabs/Dropdown/Select) relies on pointer-capture + scrollIntoView, which jsdom lacks.
if (typeof window !== "undefined") {
  if (!Element.prototype.hasPointerCapture) Element.prototype.hasPointerCapture = () => false;
  if (!Element.prototype.releasePointerCapture) Element.prototype.releasePointerCapture = () => {};
  if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
