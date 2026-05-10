import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { and, eq } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_otps, hr_users } from "@/db/schema";
import { env } from "@/config";
import { AppError } from "@/middlewares";
import type { SignOptions } from "jsonwebtoken";

export type HrRole = "EMPLOYEE" | "IT" | "HR";

export interface HrJwtPayload {
  id: string;
  email: string;
  role: HrRole;
  type: "access" | "refresh";
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  code: string;
  role: Exclude<HrRole, "IT">;
  department?: string | null;
  position?: string | null;
  location?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().split(/\s+/).filter(Boolean);
  const last = lastName.trim().split(/\s+/).filter(Boolean);
  const chars: string[] = [];
  if (first[0]?.[0]) chars.push(first[0][0]);
  if (first[1]?.[0]) chars.push(first[1][0]);
  if (last[0]?.[0]) chars.push(last[0][0]);
  if (chars.length === 0) return "NA";
  return chars.join("").toUpperCase();
}

async function signToken(payload: HrJwtPayload, expiresIn: string): Promise<string> {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as unknown as number });
}

async function signRefreshToken(
  payload: Omit<HrJwtPayload, "type">,
  expiresIn: string,
): Promise<string> {
  return jwt.sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: expiresIn as unknown as number });
}

export async function createOtp(createdById: string, email: string): Promise<{ code: string; expiresAt: Date }> {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(hr_otps).values({
    code,
    email,
    created_by_id: createdById,
    expires_at: expiresAt,
    used: false,
  });

  return { code, expiresAt };
}

export async function registerWithOtp(input: RegisterInput): Promise<{ userId: string }> {
  return await withDbTransaction(async (tx) => {
    const otp = await tx
      .select()
      .from(hr_otps)
      .where(and(eq(hr_otps.email, input.email), eq(hr_otps.code, input.code), eq(hr_otps.used, false)))
      .limit(1);

    if (!otp.length) throw new AppError("Invalid OTP code", 400);
    if (otp[0].expires_at <= new Date()) throw new AppError("OTP has expired", 400);

    const existing = await tx.select({ id: hr_users.id }).from(hr_users).where(eq(hr_users.email, input.email)).limit(1);
    if (existing.length) throw new AppError("Email already in use", 409);

    // if (input.role === "IT") throw new AppError("Cannot register IT via OTP", 400);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const avatarInitials = buildInitials(input.firstName, input.lastName);

    const inserted = await tx
      .insert(hr_users)
      .values({
        first_name: input.firstName,
        last_name: input.lastName,
        email: input.email,
        password_hash: passwordHash,
        role: input.role,
        department: input.department ?? null,
        position: input.position ?? null,
        location: input.location ?? null,
        avatar_initials: avatarInitials,
      })
      .returning({ id: hr_users.id });

    await tx.update(hr_otps).set({ used: true }).where(eq(hr_otps.id, otp[0].id));

    return { userId: inserted[0].id };
  });
}

export async function login(input: LoginInput): Promise<{ user: { id: string; email: string; role: HrRole }; tokens: AuthTokens }> {
  const rows = await db.select().from(hr_users).where(eq(hr_users.email, input.email)).limit(1);
  if (!rows.length) throw new AppError("Invalid credentials", 401);

  const user = rows[0];
  const passwordValid = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordValid) throw new AppError("Invalid credentials", 401);

  const accessToken = await signToken(
    { id: user.id, email: user.email, role: user.role as HrRole, type: "access" },
    env.ACCESS_TOKEN_EXPIRY,
  );
  const refreshToken = await signRefreshToken(
    { id: user.id, email: user.email, role: user.role as HrRole },
    env.REFRESH_TOKEN_EXPIRY,
  );

  const refreshHash = await bcrypt.hash(refreshToken, 10);
  await db.update(hr_users).set({ refresh_token_hash: refreshHash, updated_at: new Date() }).where(eq(hr_users.id, user.id));

  return {
    user: { id: user.id, email: user.email, role: user.role as HrRole },
    tokens: { accessToken, refreshToken },
  };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let decoded: unknown;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const payload = decoded as Partial<HrJwtPayload>;
  if (!payload.id || payload.type !== "refresh") throw new AppError("Invalid refresh token", 401);

  const rows = await db.select().from(hr_users).where(eq(hr_users.id, String(payload.id))).limit(1);
  if (!rows.length) throw new AppError("User not found", 404);

  const user = rows[0];
  if (!user.refresh_token_hash) throw new AppError("Refresh token revoked", 401);

  const matches = await bcrypt.compare(refreshToken, user.refresh_token_hash);
  if (!matches) throw new AppError("Refresh token revoked", 401);

  const accessToken = await signToken(
    { id: user.id, email: user.email, role: user.role as HrRole, type: "access" },
    env.ACCESS_TOKEN_EXPIRY,
  );
  const newRefreshToken = await signRefreshToken(
    { id: user.id, email: user.email, role: user.role as HrRole },
    env.REFRESH_TOKEN_EXPIRY,
  );

  const refreshHash = await bcrypt.hash(newRefreshToken, 10);
  await db.update(hr_users).set({ refresh_token_hash: refreshHash, updated_at: new Date() }).where(eq(hr_users.id, user.id));

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string): Promise<void> {
  await db.update(hr_users).set({ refresh_token_hash: null, updated_at: new Date() }).where(eq(hr_users.id, userId));
}

export async function getMe(userId: string) {
  const rows = await db.select().from(hr_users).where(eq(hr_users.id, userId)).limit(1);
  if (!rows.length) throw new AppError("User not found", 404);
  const u = rows[0];
  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    email: u.email,
    role: u.role,
    status: u.status,
    department: u.department,
    position: u.position,
    location: u.location,
    joinDate: u.join_date,
    avatarInitials: u.avatar_initials,
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

