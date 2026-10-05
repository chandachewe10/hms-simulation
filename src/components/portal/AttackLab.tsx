"use client";

import { useState } from "react";
import { ATTACK_BUTTONS, runPresentationAttack } from "@/lib/portal-access";
import type { PresentationScenarioId } from "@/simulation/types";
import { appendAudit } from "@/lib/audit-log";

export function AttackLab({ model }: { model: "traditional" | "zt" }) {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function simulate(id: PresentationScenarioId) {
    setLoading(true);
    window.setTimeout(() => {
      const { traditional, zeroTrust } = runPresentationAttack(id);
      const outcome = model === "traditional" ? traditional : zeroTrust;
      const auth = outcome.authorization;
      const granted = auth.accessGranted && !auth.stepUpRequired;

      if (model === "traditional") {
        if (granted) {
          appendAudit({
            model: "traditional_rbac",
            kind: "attack",
            summary: `Attack succeeded: ${id.replace(/_/g, " ")}`,
            detail: auth.reasonSummary.join(" · ") || "RBAC allowed access on trusted network.",
            decision: auth.decision,
          });
          setLastMessage(
            `⚠ Attack succeeded — ${auth.decision}. Records exposed: ${auth.recordsExposed}. Perimeter trust did not stop this pattern.`
          );
        } else {
          appendAudit({
            model: "traditional_rbac",
            kind: "blocked",
            summary: `Request denied (unusual for legacy): ${id}`,
            decision: auth.decision,
          });
          setLastMessage(`Request denied: ${auth.decision}`);
        }
      } else {
        if (granted && !auth.limitedAccess) {
          appendAudit({
            model: "zero_trust",
            kind: "alert",
            summary: `Partial bypass attempt: ${id}`,
            riskScore: auth.risk.score,
            decision: auth.decision,
          });
          setLastMessage(
            `Limited exposure — ${auth.decision}. Risk ${auth.risk.score}/100.`
          );
        } else {
          appendAudit({
            model: "zero_trust",
            kind: "blocked",
            summary: `Attack blocked: ${id.replace(/_/g, " ")}`,
            detail: auth.reasonSummary.slice(0, 3).join(" · "),
            riskScore: auth.risk.score,
            decision: auth.decision,
          });
          setLastMessage(
            `✓ Attack did not succeed — ${auth.decision}. Risk score ${auth.risk.score}/100. ${auth.reasonSummary[0] ?? ""}`
          );
        }
      }
      setLoading(false);
    }, 400);
  }

  return (
    <section
      className={`rounded-xl border p-5 ${
        model === "traditional"
          ? "bg-[#faf8f4] border-[#c9c2b5]"
          : "bg-white border-[#0d7a6f]/25 shadow-sm"
      }`}
    >
      <h2 className="text-lg font-semibold text-[#0a2e4a]">
        {model === "traditional"
          ? "Simulated threat lab (vulnerable path)"
          : "Threat simulation (protected path)"}
      </h2>
      <p className="text-sm text-[#5c6578] mt-1 mb-4">
        {model === "traditional"
          ? "Run the same scripted attacks used in the research engine. On the legacy portal they often succeed because trust is inherited from the network."
          : "Identical attack scripts are evaluated by the Zero Trust policy engine. Expect step-up, limited access, or block."}
      </p>
      <div className="grid sm:grid-cols-2 gap-2">
        {ATTACK_BUTTONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={loading}
            onClick={() => simulate(a.id)}
            className={`text-left rounded-lg px-3 py-2.5 text-sm border transition ${
              model === "traditional"
                ? "border-[#d4cfc4] hover:border-[#c45c3e] hover:bg-[#fff5f3]"
                : "border-[#cfe8e4] hover:border-[#0d7a6f] hover:bg-[#e6f4f1]"
            }`}
          >
            <span className="font-medium text-[#0a2e4a]">{a.label}</span>
            <span className="block text-xs text-[#6b7280] mt-0.5">{a.description}</span>
          </button>
        ))}
      </div>
      {lastMessage && (
        <p
          className={`mt-4 text-sm rounded-lg px-4 py-3 ${
            model === "traditional"
              ? "bg-[#fff1e6] border border-[#f4c4a0] text-[#7c2d12]"
              : "bg-[#e6f4f1] border border-[#0d7a6f]/30 text-[#0a3d36]"
          }`}
        >
          {lastMessage}
        </p>
      )}
    </section>
  );
}
