"use client";

import Link from "next/link";
import { clearSession, type DemoSession } from "@/lib/auth-demo";

export function PortalShell({
  session,
  variant,
  children,
}: {
  session: DemoSession;
  variant: "traditional" | "zt";
  children: React.ReactNode;
}) {
  const isZt = variant === "zt";

  function signOut() {
    clearSession();
    window.location.href = "/";
  }

  return (
    <div
      className={`min-h-screen ${isZt ? "bg-[#f4f7f6]" : "bg-[#eceae4]"}`}
    >
      <header
        className={
          isZt
            ? "bg-[#0a2e4a] text-white shadow-md"
            : "bg-[#5c6370] text-white shadow"
        }
      >
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-75 uppercase tracking-wide">
              {isZt ? "Zero Trust clinical workspace" : "Legacy EMR — intranet"}
            </p>
            <p className="font-medium text-sm">{session.displayName}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {isZt && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0d7a6f]/30 text-[#a7f3e8] text-xs">
                MFA ✓ · Risk monitoring on
              </span>
            )}
            <button
              type="button"
              onClick={signOut}
              className="opacity-90 hover:opacity-100 underline-offset-2 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      <footer className="max-w-6xl mx-auto px-4 pb-8 text-xs text-[#6b7280]">
        <Link href="/" className="hover:text-[#0a2e4a]">
          Simulation home
        </Link>
        {" · "}
        Academic SmartCare-inspired environment — not production.
      </footer>
    </div>
  );
}
