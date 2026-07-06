import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { and, eq, or } from "drizzle-orm";
import { db, withDbTransaction } from "@/db/client";
import { hr_otps, hr_users } from "@/db/schema";
import { env } from "@/config";
import { AppError } from "@/middlewares";

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
  email: string; // Used as the personal_email for registration tracking / OTP mapping
  password: string;
  code: string;
  role: Exclude<HrRole, "IT">;
}

export interface LoginInput {
  password: string;
  email: string;
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
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
}

async function signRefreshToken(
  payload: Omit<HrJwtPayload, "type">,
  expiresIn: string,
): Promise<string> {
  return jwt.sign({ ...payload, type: "refresh" }, env.JWT_REFRESH_SECRET, { expiresIn: expiresIn as any });
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

    // Ensure personal email isn't already taken across accounts
    const existing = await tx
      .select({ id: hr_users.id })
      .from(hr_users)
      .where(
        or(
          eq(hr_users.personal_email, input.email),
          eq(hr_users.work_email, input.email)
        )
      )
      .limit(1);
      
    if (existing.length) throw new AppError("Email already in use", 409);

    const passwordHash = await bcrypt.hash(input.password, 10);
    const avatarInitials = buildInitials(input.firstName, input.lastName);

    const inserted = await tx
      .insert(hr_users)
      .values({
        first_name: input.firstName,
        last_name: input.lastName,
        personal_email: input.email,
        password_hash: passwordHash,
        role: input.role,
        avatar_initials: avatarInitials,
      })
      .returning({ id: hr_users.id });

    await tx.update(hr_otps).set({ used: true }).where(eq(hr_otps.id, otp[0].id));

    return { userId: inserted[0].id };
  });
}

export async function login(input: LoginInput): Promise<{ user: { id: string; email: string; role: HrRole }; tokens: AuthTokens }> {
  // Enforce authentication exclusively via the work_email column
  const rows = await db.select().from(hr_users).where(eq(hr_users.work_email, input.email)).limit(1);
  if (!rows.length) throw new AppError("Invalid credentials", 401);

  const user = rows[0];
  const passwordValid = await bcrypt.compare(input.password, user.password_hash);
  if (!passwordValid) throw new AppError("Invalid credentials", 401);

  const userEmail = user.work_email ?? user.personal_email;

  const accessToken = await signToken(
    { id: String(user.id), email: userEmail, role: user.role as HrRole, type: "access" },
    env.ACCESS_TOKEN_EXPIRY,
  );
  const refreshToken = await signRefreshToken(
    { id: String(user.id), email: userEmail, role: user.role as HrRole },
    env.REFRESH_TOKEN_EXPIRY,
  );

  const refreshHash = await bcrypt.hash(refreshToken, 10);
  await db.update(hr_users).set({ refresh_token_hash: refreshHash }).where(eq(hr_users.id, user.id));

  return {
    user: { id: String(user.id), email: userEmail, role: user.role as HrRole },
    tokens: { accessToken, refreshToken },
  };
}

export async function refresh(refreshToken: string): Promise<AuthTokens> {
  let decoded: any;
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

  const userEmail = user.work_email ?? user.personal_email;

  const accessToken = await signToken(
    { id: String(user.id), email: userEmail, role: user.role as HrRole, type: "access" },
    env.ACCESS_TOKEN_EXPIRY,
  );
  const newRefreshToken = await signRefreshToken(
    { id: String(user.id), email: userEmail, role: user.role as HrRole },
    env.REFRESH_TOKEN_EXPIRY,
  );

  const refreshHash = await bcrypt.hash(newRefreshToken, 10);
  await db.update(hr_users).set({ refresh_token_hash: refreshHash }).where(eq(hr_users.id, user.id));

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(userId: string): Promise<void> {
  await db.update(hr_users).set({ refresh_token_hash: null }).where(eq(hr_users.id, userId));
}

export async function getMe(userId: string) {
  const rows = await db.select().from(hr_users).where(eq(hr_users.id, userId)).limit(1);
  if (!rows.length) throw new AppError("User not found", 404);
  const u = rows[0];
  
  return {
    id: u.id,
    platformUserId: u.platform_user_id,
    firstName: u.first_name,
    lastName: u.last_name,
    personalEmail: u.personal_email,
    workEmail: u.work_email,
    phone: u.phone,
    picture: u.picture,
    citizenship: u.citizenship,
    homeCountry: u.home_country,
    homeCity: u.home_city,
    role: u.role,
    status: u.status,
    avatarInitials: u.avatar_initials,
    requiresPasswordReset: u.requires_password_reset,
    profileSetupCompleted: u.profile_setup_completed,
  };
}