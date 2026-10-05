import type { SecurityModel, UserRole } from "@/simulation/types";

export type DemoSession = {
  model: SecurityModel;
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  mfaVerified: boolean;
  deviceLabel: string;
  loggedInAt: string;
};

const SESSION_KEY = "zt-sim-session";
const ADMIN_KEY = "zt-sim-admin";

export const DEMO_USERS: Record<
  string,
  { password: string; role: UserRole; displayName: string }
> = {
  doctor: { password: "SmartCare2024", role: "doctor", displayName: "Dr. Chanda Phiri" },
  nurse: { password: "SmartCare2024", role: "nurse", displayName: "Mutale Banda" },
  admin: { password: "Admin@Sim2024", role: "administrator", displayName: "Hospital Admin" },
};

export const ADMIN_CREDENTIALS = { username: "analyst", password: "Analyze@2024" };

export function validateTraditionalLogin(username: string, password: string): boolean {
  const u = DEMO_USERS[username.toLowerCase()];
  return !!u && u.password === password;
}

export function validateZeroTrustLogin(
  username: string,
  password: string,
  mfaCode: string
): { ok: boolean; error?: string } {
  const u = DEMO_USERS[username.toLowerCase()];
  if (!u || u.password !== password) {
    return { ok: false, error: "Invalid username or password." };
  }
  if (mfaCode.replace(/\s/g, "") !== "123456") {
    return { ok: false, error: "Invalid MFA code. Use 123456 for this simulation." };
  }
  return { ok: true };
}

export function createSession(
  model: SecurityModel,
  username: string,
  mfaVerified: boolean
): DemoSession {
  const u = DEMO_USERS[username.toLowerCase()];
  const session: DemoSession = {
    model,
    userId: `demo-${username}`,
    username: username.toLowerCase(),
    displayName: u?.displayName ?? username,
    role: u?.role ?? "doctor",
    mfaVerified,
    deviceLabel: model === "zero_trust" ? "Managed clinic laptop" : "Hospital workstation",
    loggedInAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  return session;
}

export function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export function setAdminAuthenticated(ok: boolean) {
  if (typeof window === "undefined") return;
  if (ok) sessionStorage.setItem(ADMIN_KEY, "1");
  else sessionStorage.removeItem(ADMIN_KEY);
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ADMIN_KEY) === "1";
}
