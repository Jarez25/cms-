import {
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "cms_admin_token";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

export interface Session {
  role: "superadmin" | "provider";
  providerId: number | null;
  expiresAt?: number;
}

function getSecret(): string {
  return process.env.ADMIN_TOKEN_SECRET || "cms-secreto";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(Buffer.from(hash, "hex"), candidate);
}

export function makeToken(userId: number, role: Session["role"]): string {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = `${userId}:${role}:${expiresAt}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}:${sig}`;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(":");
  // Token moderno con expiración: userId:role:expiresAt:sig
  if (parts.length === 4) {
    const [userId, role, expStr, sig] = parts;
    const expiresAt = Number(expStr);
    if (!expiresAt || Date.now() > expiresAt) return null; // Token expirado

    const expected = createHmac("sha256", getSecret()).update(`${userId}:${role}:${expStr}`).digest("hex");
    if (sig !== expected) return null;

    if (role === "superadmin") return { role: "superadmin", providerId: null, expiresAt };
    if (role === "provider") return { role: "provider", providerId: Number(userId), expiresAt };
    return null;
  }

  // Retrocompatibilidad con tokens anteriores sin exp: userId:role:sig
  if (parts.length === 3) {
    const [userId, role, sig] = parts;
    const expected = createHmac("sha256", getSecret()).update(`${userId}:${role}`).digest("hex");
    if (sig !== expected) return null;
    if (role === "superadmin") return { role: "superadmin", providerId: null };
    if (role === "provider") return { role: "provider", providerId: Number(userId) };
  }

  return null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "superadmin";
}

export async function setAdminCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}
