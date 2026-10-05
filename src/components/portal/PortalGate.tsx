"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readSession, type DemoSession } from "@/lib/auth-demo";
import { PortalShell } from "./PortalShell";
import { RecordBrowser } from "./RecordBrowser";
import { AttackLab } from "./AttackLab";

export function PortalGate({ expected }: { expected: "traditional_rbac" | "zero_trust" }) {
  const [session, setSession] = useState<DemoSession | null | undefined>(undefined);

  useEffect(() => {
    setSession(readSession());
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f5f0] text-[#0a2e4a]">
        Loading session…
      </div>
    );
  }

  if (!session || session.model !== expected) {
    const login =
      expected === "traditional_rbac" ? "/login/traditional" : "/login/zero-trust";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f5f0] px-4">
        <p className="text-[#0a2e4a] mb-4">Sign in with the correct portal to continue.</p>
        <Link
          href={login}
          className="rounded-lg bg-[#0a2e4a] text-white px-5 py-2.5 text-sm font-medium"
        >
          Go to login
        </Link>
      </div>
    );
  }

  const variant = expected === "traditional_rbac" ? "traditional" : "zt";

  return (
    <PortalShell session={session} variant={variant}>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <RecordBrowser session={session} />
        </div>
        <div className="lg:col-span-2">
          <AttackLab model={variant} />
        </div>
      </div>
    </PortalShell>
  );
}
