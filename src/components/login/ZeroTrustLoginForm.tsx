"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createSession,
  validateZeroTrustLogin,
} from "@/lib/auth-demo";
import { appendAudit } from "@/lib/audit-log";

export function ZeroTrustLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("doctor");
  const [password, setPassword] = useState("");
  const [mfa, setMfa] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = validateZeroTrustLogin(username, password, mfa);
    if (!result.ok) {
      setError(result.error ?? "Login failed");
      return;
    }
    createSession("zero_trust", username, true);
    appendAudit({
      model: "zero_trust",
      kind: "login",
      summary: `${username} signed in with MFA`,
      detail: "Device posture verified · session continuously validated.",
      riskScore: 12,
      decision: "ALLOW",
    });
    router.push("/portal/zero-trust");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 rounded-full bg-[#e6f4f1] text-[#0d7a6f] border border-[#0d7a6f]/20">
          Device trusted
        </span>
        <span className="px-2 py-1 rounded-full bg-[#e8eef5] text-[#0a2e4a] border border-[#0a2e4a]/10">
          Lusaka clinic network
        </span>
      </div>
      <p className="text-sm text-[#5c6578] leading-relaxed">
        Password plus simulated MFA. Every session is verified continuously;
        context feeds the risk engine before PHI is released.
      </p>
      {error && (
        <p className="text-sm text-[#b42318] bg-[#fef3f2] border border-[#fecdca] rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <label className="block text-sm font-medium text-[#0a2e4a]">
        Username
        <input
          className="mt-1 w-full rounded-lg border border-[#c9c2b5] bg-white px-3 py-2.5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-[#0a2e4a]">
        Password
        <input
          type="password"
          className="mt-1 w-full rounded-lg border border-[#c9c2b5] bg-white px-3 py-2.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-[#0a2e4a]">
        MFA code (authenticator)
        <input
          className="mt-1 w-full rounded-lg border border-[#0d7a6f]/40 bg-white px-3 py-2.5 tracking-widest"
          placeholder="6 digits"
          value={mfa}
          onChange={(e) => setMfa(e.target.value)}
          inputMode="numeric"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#0a2e4a] hover:bg-[#0d3d5c] text-white font-medium py-2.5 transition"
      >
        Verify &amp; enter secure portal
      </button>
      <p className="text-xs text-[#8a8175] text-center">
        Demo MFA code: <code className="bg-[#e6f4f1] px-1 rounded">123456</code>
      </p>
    </form>
  );
}
