"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_SIMULATION_PARAMETERS,
  runExperiment,
} from "@/simulation/experiments";
import type { ExperimentResult, SimulationParameters } from "@/simulation/types";
import { downloadText, experimentToJson, metricsToCsv } from "@/lib/export";
import { ResearchFrame } from "./ResearchFrame";
import { ParameterControls } from "./ParameterControls";
import { MetricsCharts } from "./MetricsCharts";
import { TopologyView } from "./TopologyView";
import { EventFeed } from "./EventFeed";
import { PresentationMode } from "./PresentationMode";

export function Dashboard() {
  const [params, setParams] = useState<SimulationParameters>(
    DEFAULT_SIMULATION_PARAMETERS
  );
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(() => {
    setRunning(true);
    window.setTimeout(() => {
      const r = runExperiment(params);
      setResult(r);
      setRunning(false);
    }, 0);
  }, [params]);

  useEffect(() => {
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial load only

  const sampleEvents = useMemo(() => {
    if (!result?.trials.length) return [];
    const lastZt = [...result.trials]
      .reverse()
      .find((t) => t.model === "zero_trust");
    return (lastZt?.outcomes ?? []).slice(-24).reverse();
  }, [result]);

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-800 pb-4">
        <p className="text-xs uppercase tracking-widest text-teal-500 mb-1">
          Research project simulation
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-50">
          Securing the Digital Pulse: Zero Trust for PHI (Zambia)
        </h1>
        <p className="text-slate-400 mt-2 max-w-3xl text-sm">
          Compare Traditional Perimeter/RBAC vs context-aware Zero Trust under
          configurable Zambia connectivity constraints. All metrics are computed
          by the TypeScript experiment engine.
        </p>
      </header>

      <ResearchFrame />
      <ParameterControls
        params={params}
        onChange={setParams}
        onRun={run}
        running={running}
      />
      <TopologyView params={params} />
      <PresentationMode params={params} />

      {result && (
        <section className="rounded-xl border border-slate-700 bg-slate-900/30 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold text-amber-200 mb-2">
            Interpretation (simulation-derived)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {result.comparisonInterpretation.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() =>
                downloadText(
                  `zt-experiment-${params.randomSeed}.json`,
                  experimentToJson(result),
                  "application/json"
                )
              }
            >
              Export JSON
            </button>
            <button
              type="button"
              className="btn-secondary text-xs"
              onClick={() =>
                downloadText(
                  `zt-metrics-${params.randomSeed}.csv`,
                  metricsToCsv(
                    result.metricsByModel.traditional_rbac,
                    result.metricsByModel.zero_trust
                  ),
                  "text/csv"
                )
              }
            >
              Export CSV
            </button>
          </div>
        </section>
      )}

      <MetricsCharts result={result} />
      <EventFeed events={sampleEvents} />
    </div>
  );
}
