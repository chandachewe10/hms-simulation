import type { AggregatedMetrics, ExperimentResult } from "@/simulation/types";
import { metricsToCsvRows } from "@/simulation/metrics";

export function experimentToJson(result: ExperimentResult): string {
  const slim = {
    parameters: result.parameters,
    assumptions: result.assumptions,
    literatureNotes: result.literatureNotes,
    limitations: result.limitations,
    metricsByModel: result.metricsByModel,
    comparisonInterpretation: result.comparisonInterpretation,
    trialCount: result.trials.length,
  };
  return JSON.stringify(slim, null, 2);
}

export function metricsToCsv(
  rbac: AggregatedMetrics,
  zt: AggregatedMetrics
): string {
  const rows = [
    ...metricsToCsvRows(rbac, "traditional_rbac"),
    ...metricsToCsvRows(zt, "zero_trust").slice(1),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

export function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
