"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ADMIN_CREDENTIALS,
  isAdminAuthenticated,
  setAdminAuthenticated,
} from "@/lib/auth-demo";
import { readAuditLog, clearAuditLog, type AuditEvent } from "@/lib/audit-log";
import { Dashboard } from "@/components/visualization/Dashboard";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function AdminConsole() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [audit, setAudit] = useState<AuditEvent[]>([]);

  const refreshAudit = useCallback(() => setAudit(readAuditLog()), []);

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
    setChecked(true);
    refreshAudit();
    const handler = () => refreshAudit();
    window.addEventListener("audit-log-updated", handler);
    return () => window.removeEventListener("audit-log-updated", handler);
  }, [refreshAudit]);

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (
      user === ADMIN_CREDENTIALS.username &&
      pass === ADMIN_CREDENTIALS.password
    ) {
      setAdminAuthenticated(true);
      setAuthed(true);
      setError("");
      return;
    }
    setError("Invalid analyst credentials.");
  }

  if (!checked) return null;

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a2e4a]">
        <SiteHeader variant="dark" />
        <div className="max-w-sm mx-auto px-4 py-20">
          <form
            onSubmit={login}
            className="bg-white rounded-2xl p-6 shadow-2xl"
          >
            <h1 className="text-xl font-serif text-[#0a2e4a]">Analyst sign-in</h1>
            <p className="text-sm text-[#5c6578] mt-2">
              Access experiment metrics and the live portal audit trail.
            </p>
            {error && (
              <p className="mt-3 text-sm text-red-700 bg-red-50 px-3 py-2 rounded">
                {error}
              </p>
            )}
            <label className="block mt-4 text-sm font-medium">
              Username
              <input
                className="mt-1 w-full border border-[#d4cfc4] rounded-lg px-3 py-2"
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </label>
            <label className="block mt-3 text-sm font-medium">
              Password
              <input
                type="password"
                className="mt-1 w-full border border-[#d4cfc4] rounded-lg px-3 py-2"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="mt-5 w-full bg-[#c45c3e] hover:bg-[#a84d34] text-white py-2.5 rounded-lg font-medium"
            >
              View analysis
            </button>
            <p className="text-xs text-center text-[#8a8175] mt-4">
              Demo: analyst / Analyze@2024
            </p>
          </form>
          <p className="text-center mt-6">
            <Link href="/" className="text-white/70 text-sm hover:text-white">
              ← Home
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-slate-200">
      <div className="border-b border-white/10 bg-[#0a2e4a]">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <p className="text-xs text-[#f0c987] uppercase tracking-widest">
              Admin analysis
            </p>
            <p className="text-sm text-white font-medium">
              Traditional vs Zero Trust — simulation evidence
            </p>
          </div>
          <div className="flex gap-3 text-sm">
            <Link href="/" className="text-white/80 hover:text-white">
              Home
            </Link>
            <button
              type="button"
              className="text-white/80 hover:text-white"
              onClick={() => {
                setAdminAuthenticated(false);
                setAuthed(false);
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-white/10 bg-[#1a2332] p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h2 className="font-semibold text-white">Live audit trail</h2>
            <button
              type="button"
              onClick={() => {
                clearAuditLog();
                refreshAudit();
              }}
              className="text-xs px-3 py-1 rounded border border-white/20 hover:bg-white/5"
            >
              Clear log
            </button>
          </div>
          {audit.length === 0 ? (
            <p className="text-sm text-slate-400">
              No events yet — use the traditional or Zero Trust portals to generate
              login, access, and attack events.
            </p>
          ) : (
            <ul className="max-h-48 overflow-y-auto text-xs space-y-1.5 font-mono">
              {audit.slice(0, 40).map((e) => (
                <li key={e.id} className="text-slate-300">
                  <span className="text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>{" "}
                  <span className="text-[#f0c987]">[{e.model}]</span> {e.kind}: {e.summary}
                  {e.riskScore != null && (
                    <span className="text-teal-400"> · risk {e.riskScore}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        <Dashboard embedded />
      </div>
    </div>
  );
}
