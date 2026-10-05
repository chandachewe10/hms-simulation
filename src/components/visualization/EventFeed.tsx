"use client";

import type { AccessRequestOutcome } from "@/simulation/types";

export function EventFeed({ events }: { events: AccessRequestOutcome[] }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-4 max-h-96 overflow-y-auto">
      <h2 className="text-base font-semibold text-teal-300 mb-2 sticky top-0 bg-slate-900/95 py-1">
        Live access events (latest trial sample)
      </h2>
      <ul className="space-y-2 text-xs">
        {events.map((e, i) => (
          <li
            key={`${e.requestId}-${i}`}
            className="border border-slate-800 rounded-md p-2 text-slate-300"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800">
                {e.model === "zero_trust" ? "ZT" : "RBAC"}
              </span>
              {e.context.isAttack && (
                <span className="text-[10px] text-red-400">ATTACK</span>
              )}
              <span className="text-slate-100">{e.user.role}</span>
              <span>→ {e.resource.kind}</span>
              <span className="text-teal-400">
                {e.authorization.decision}
              </span>
              {e.model === "zero_trust" && (
                <span>Risk {e.authorization.risk.score}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
