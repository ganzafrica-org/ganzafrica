/**
 * email.service.ts sends over SMTP (Azure Communication Services) via nodemailer. This mocks
 * nodemailer and env so it never touches a real SMTP server, and reloads the module per test
 * (vi.resetModules) since the transporter is built once at module-load time from env.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const sendMailMock = vi.fn();
const verifyMock = vi.fn();
const createTransportMock = vi.fn(() => ({ sendMail: sendMailMock, verify: verifyMock }));

vi.mock("nodemailer", () => ({
  default: { createTransport: (...args: unknown[]) => createTransportMock(...args) },
}));

let mockEnv: Record<string, unknown>;

vi.mock("../../src/config", () => ({
  env: new Proxy(
    {},
    {
      get: (_target, prop: string) => mockEnv[prop],
    },
  ),
  Logger: class {
    constructor(_context: string) {}
    debug() {}
    info() {}
    warn() {}
    error() {}
  },
}));

async function loadEmailService() {
  vi.resetModules();
  return import("../../src/services/email.service");
}

describe("email.service (SMTP)", () => {
  beforeEach(() => {
    sendMailMock.mockReset();
    verifyMock.mockReset();
    createTransportMock.mockClear();
    mockEnv = {
      SMTP_HOST: "smtp.azurecomm.net",
      SMTP_PORT: 587,
      SMTP_USER: "ganzafrica-acs.some-guid",
      SMTP_PASSWORD: "secret",
      EMAIL_FROM: "it@ganzafrica.org",
      NODE_ENV: "test",
    };
  });

  it("builds the transporter from env and sends via SMTP", async () => {
    sendMailMock.mockResolvedValue({ messageId: "abc123" });
    const { sendEmail } = await loadEmailService();

    const result = await sendEmail("someone@example.com", "Subject", "<p>hi</p>", "hi");

    expect(createTransportMock).toHaveBeenCalledWith({
      host: "smtp.azurecomm.net",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: { user: "ganzafrica-acs.some-guid", pass: "secret" },
    });
    expect(sendMailMock).toHaveBeenCalledWith({
      from: "it@ganzafrica.org",
      to: "someone@example.com",
      subject: "Subject",
      html: "<p>hi</p>",
      text: "hi",
    });
    expect(result).toEqual({ messageId: "abc123" });
  });

  it("omits the text field when no text part is given", async () => {
    sendMailMock.mockResolvedValue({ messageId: "abc" });
    const { sendEmail } = await loadEmailService();

    await sendEmail("someone@example.com", "Subject", "<p>hi</p>");

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.not.objectContaining({ text: expect.anything() }),
    );
  });

  it("defaults the port to 587 when SMTP_PORT is unset", async () => {
    mockEnv.SMTP_PORT = undefined;
    sendMailMock.mockResolvedValue({ messageId: "x" });
    const { sendEmail } = await loadEmailService();

    await sendEmail("someone@example.com", "Subject", "<p>hi</p>");

    expect(createTransportMock).toHaveBeenCalledWith(expect.objectContaining({ port: 587 }));
  });

  it("falls back to logging and returns null when SMTP is not configured", async () => {
    mockEnv.SMTP_HOST = undefined;
    mockEnv.SMTP_USER = undefined;
    mockEnv.SMTP_PASSWORD = undefined;
    const { sendEmail } = await loadEmailService();

    const result = await sendEmail(
      "someone@example.com",
      "Subject",
      '<a href="https://example.com/link">click</a>',
    );

    expect(result).toBeNull();
    expect(createTransportMock).not.toHaveBeenCalled();
    expect(sendMailMock).not.toHaveBeenCalled();
  });

  it("throws an AppError when the SMTP send fails", async () => {
    sendMailMock.mockRejectedValue(new Error("boom"));
    const { sendEmail } = await loadEmailService();

    await expect(sendEmail("someone@example.com", "Subject", "<p>hi</p>")).rejects.toThrow(
      "Failed to send email",
    );
  });

  it("verifyEmailConnection returns true when the SMTP connection verifies", async () => {
    verifyMock.mockResolvedValue(true);
    const { verifyEmailConnection } = await loadEmailService();

    await expect(verifyEmailConnection()).resolves.toBe(true);
    expect(verifyMock).toHaveBeenCalled();
  });

  it("verifyEmailConnection returns false when SMTP is not configured", async () => {
    mockEnv.SMTP_HOST = undefined;
    const { verifyEmailConnection } = await loadEmailService();

    await expect(verifyEmailConnection()).resolves.toBe(false);
    expect(verifyMock).not.toHaveBeenCalled();
  });

  it("verifyEmailConnection returns false when verify() throws", async () => {
    verifyMock.mockRejectedValue(new Error("nope"));
    const { verifyEmailConnection } = await loadEmailService();

    await expect(verifyEmailConnection()).resolves.toBe(false);
  });
});
