"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createSession,
  validateTraditionalLogin,
} from "@/lib/auth-demo";
import { appendAudit } from "@/lib/audit-log";

export function TraditionalLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("doctor");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateTraditionalLogin(username, password)) {
      setError("Invalid credentials. Try doctor / SmartCare2024");
      return;
    }
    createSession("traditional_rbac", username, false);
    appendAudit({
      model: "traditional_rbac",
      kind: "login",
      summary: `${username} signed in (password only)`,
      detail: "No MFA or device posture check — trusted network assumed.",
    });
    router.push("/portal/traditional");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm text-[#5c6578] leading-relaxed">
        Simulates legacy hospital SSO: username and password only. Inside the
        firewall, the session is implicitly trusted.
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
          autoComplete="username"
        />
      </label>
      <label className="block text-sm font-medium text-[#0a2e4a]">
        Password
        <input
          type="password"
          className="mt-1 w-full rounded-lg border border-[#c9c2b5] bg-white px-3 py-2.5"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-[#6b7280] hover:bg-[#4b5563] text-white font-medium py-2.5 transition"
      >
        Sign in to clinical portal
      </button>
      <p className="text-xs text-[#8a8175] text-center">
        Demo: <code className="bg-[#ebe6dc] px-1 rounded">doctor</code> /{" "}
        <code className="bg-[#ebe6dc] px-1 rounded">SmartCare2024</code>
      </p>
    </form>
  );
}
