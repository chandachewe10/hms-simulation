import type { AccessRequestOutcome } from "@/simulation/types";

export function OutcomeCard({
  title,
  outcome,
}: {
  title: string;
  outcome: AccessRequestOutcome;
}) {
  const auth = outcome.authorization;
  return (
    <div className="rounded-lg border border-slate-600 bg-slate-950/80 p-4 text-sm">
      <h4 className="font-semibold text-slate-200 mb-2">{title}</h4>
      <p
        className={
          auth.accessGranted && !auth.limitedAccess
            ? "text-red-400 font-bold"
            : auth.limitedAccess
              ? "text-amber-300 font-bold"
              : "text-emerald-400 font-bold"
        }
      >
        {auth.accessGranted
          ? auth.limitedAccess
            ? "LIMITED ACCESS"
            : "ACCESS GRANTED"
          : auth.stepUpRequired
            ? "STEP-UP AUTHENTICATION"
            : "ACCESS DENIED"}
      </p>
      <p className="text-slate-400 mt-1">
        Decision: {auth.decision} · Records exposed: {auth.recordsExposed}
      </p>
      {outcome.model === "zero_trust" && (
        <p className="text-teal-300 mt-1">Risk: {auth.risk.score}/100</p>
      )}
      {auth.reasonSummary.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-slate-400 space-y-0.5">
          {auth.reasonSummary.slice(0, 6).map((r) => (
            <li key={r}>{r}</li>
          ))}
          {auth.risk.factors.slice(0, 4).map((f) => (
            <li key={f.factor}>
              {f.factor}: {f.points} — {f.detail}
            </li>
          ))}
        </ul>
      )}
      <details className="mt-2 text-xs text-slate-500">
        <summary className="cursor-pointer">Pipeline</summary>
        <ol className="list-decimal pl-4 mt-1 space-y-0.5">
          {outcome.pipeline.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>
    </div>
  );
}
