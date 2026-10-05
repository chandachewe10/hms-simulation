export type AuditEvent = {
  id: string;
  at: string;
  model: "traditional_rbac" | "zero_trust" | "system";
  kind: "login" | "access" | "attack" | "blocked" | "alert";
  summary: string;
  detail?: string;
  riskScore?: number;
  decision?: string;
};

const KEY = "zt-sim-audit-log";
const MAX = 500;

export function readAuditLog(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuditEvent[]) : [];
  } catch {
    return [];
  }
}

export function appendAudit(event: Omit<AuditEvent, "id" | "at">): AuditEvent {
  const entry: AuditEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
  };
  if (typeof window === "undefined") return entry;
  const log = [entry, ...readAuditLog()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(log));
  window.dispatchEvent(new CustomEvent("audit-log-updated"));
  return entry;
}

export function clearAuditLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("audit-log-updated"));
}
