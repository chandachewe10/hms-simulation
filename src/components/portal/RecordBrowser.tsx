"use client";

import { RESOURCE_META, generateResources } from "@/simulation/resources";
import { authorizeRbac } from "@/simulation/rbac";
import { authorizeZeroTrust } from "@/simulation/zero-trust";
import { generateUsers, zeroTrustAllowedKinds, rbacPermissions } from "@/simulation/users";
import { generateDevices } from "@/simulation/devices";
import { SeededRng } from "@/simulation/rng";
import { DEFAULT_SIMULATION_PARAMETERS } from "@/simulation/experiments";
import { buildLegitimateContext } from "@/simulation/attacks";
import type { DemoSession } from "@/lib/auth-demo";
import { appendAudit } from "@/lib/audit-log";
import { useMemo, useState } from "react";

export function RecordBrowser({ session }: { session: DemoSession }) {
  const resources = useMemo(
    () => generateResources(12, "ZM-LIVE").slice(0, 8),
    []
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  function openRecord(resourceId: string) {
    const resource = resources.find((r) => r.id === resourceId)!;
    const rng = new SeededRng(99);
    const users = generateUsers(10, rng, 0.65, 0.3);
    const user = users.find((u) => u.role === session.role) ?? users[0];
    const devices = generateDevices(10, users, rng, session.model === "zero_trust" ? 0.9 : 0.5);
    const device = devices[0];
    const ctx = buildLegitimateContext(user, device, resource, new Date());

    const network = DEFAULT_SIMULATION_PARAMETERS.network;
    const outcome =
      session.model === "traditional_rbac"
        ? authorizeRbac(user, device, resource, ctx, network)
        : authorizeZeroTrust(user, device, resource, ctx, network);

    const auth = outcome.authorization;
    setSelected(resourceId);
    setResult(
      `${auth.decision} — ${auth.accessGranted ? (auth.limitedAccess ? "Limited view" : "Full access") : "No access"}`
    );

    appendAudit({
      model: session.model,
      kind: auth.accessGranted ? "access" : "blocked",
      summary: `Open ${resource.kind} (${resource.sensitivity})`,
      riskScore: auth.risk.score,
      decision: auth.decision,
    });
  }

  return (
    <section className="rounded-xl bg-white border border-[#d4cfc4] shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-[#ebe6dc] bg-[#faf8f4]">
        <h2 className="font-semibold text-[#0a2e4a]">Patient records</h2>
        <p className="text-xs text-[#6b7280]">
          {session.model === "zero_trust"
            ? "Each open request re-evaluates risk and least privilege."
            : "Role-based list — minimal continuous checks."}
        </p>
      </div>
      <ul className="divide-y divide-[#ebe6dc]">
        {resources.map((r) => {
          const meta = RESOURCE_META[r.kind];
          const allowed =
            session.model === "zero_trust"
              ? zeroTrustAllowedKinds(session.role).has(r.kind)
              : rbacPermissions(session.role).has(r.kind);
          return (
            <li key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#1a202c]">{meta.label}</p>
                <p className="text-xs text-[#6b7280]">
                  Sensitivity: {r.sensitivity} · {r.patientId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openRecord(r.id)}
                className="shrink-0 text-sm px-3 py-1.5 rounded-lg bg-[#0a2e4a] text-white hover:bg-[#0d3d5c] disabled:opacity-40"
                disabled={!allowed && session.model === "zero_trust"}
              >
                Open
              </button>
            </li>
          );
        })}
      </ul>
      {selected && result && (
        <p className="px-5 py-3 text-sm bg-[#f4f7f6] border-t border-[#ebe6dc] text-[#0a2e4a]">
          Last action: {result}
        </p>
      )}
    </section>
  );
}
