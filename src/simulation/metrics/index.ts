import type {
  AccessRequestOutcome,
  AggregatedMetrics,
  SecurityModel,
} from "../types";

export function aggregateMetrics(
  model: SecurityModel,
  outcomes: AccessRequestOutcome[]
): AggregatedMetrics {
  const attacks = outcomes.filter((o) => o.context.isAttack);
  const legit = outcomes.filter((o) => !o.context.isAttack);

  const successfulUnauthorized = attacks.filter(
    (o) =>
      o.authorization.accessGranted &&
      !o.authorization.limitedAccess &&
      o.authorization.recordsExposed > 0
  ).length;

  const prevented = attacks.filter((o) => o.authorization.preventionEvent).length;
  const detected = attacks.filter((o) => o.authorization.detectionEvent).length;

  const falsePositives = legit.filter(
    (o) => !o.authorization.accessGranted
  ).length;
  const falseNegatives = attacks.filter(
    (o) =>
      o.authorization.accessGranted &&
      !o.authorization.limitedAccess &&
      !o.authorization.detectionEvent
  ).length;

  const authLatencies = outcomes.map((o) => o.authentication.latencyMs);
  const authzLatencies = outcomes.map((o) => o.authorization.latencyMs);

  const allowed = outcomes.filter((o) => o.authorization.accessGranted).length;
  const denied = outcomes.length - allowed;

  return {
    model,
    attackAttempts: attacks.length,
    successfulUnauthorizedAccess: successfulUnauthorized,
    attackPreventionRate: rate(prevented, attacks.length),
    detectionRate: rate(detected, attacks.length),
    falsePositives,
    falseNegatives,
    authLatencyMean: mean(authLatencies),
    authLatencyMedian: median(authLatencies),
    authLatencyStdDev: stdDev(authLatencies),
    authzLatencyMean: mean(authzLatencies),
    authzLatencyMedian: median(authzLatencies),
    authzLatencyStdDev: stdDev(authzLatencies),
    policyDecisionTimeMean: mean(authzLatencies),
    securityAlerts: outcomes.filter((o) => o.authorization.alertRaised)
      .length,
    compromisedSessions: outcomes.filter(
      (o) => o.authorization.sessionCompromised
    ).length,
    patientRecordsExposed: outcomes.reduce(
      (s, o) => s + (o.context.isAttack ? o.authorization.recordsExposed : 0),
      0
    ),
    confidentialityImpactTotal: outcomes.reduce(
      (s, o) => s + o.authorization.confidentialityImpact,
      0
    ),
    integrityImpactTotal: outcomes.reduce(
      (s, o) => s + o.authorization.integrityImpact,
      0
    ),
    availabilityImpactTotal: outcomes.reduce(
      (s, o) => s + o.authorization.availabilityImpact,
      0
    ),
    allowedRequests: allowed,
    deniedRequests: denied,
    riskScores: outcomes
      .filter((o) => o.model === "zero_trust")
      .map((o) => o.authorization.risk.score),
  };
}

function rate(n: number, d: number): number {
  if (d === 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance =
    values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function metricsToCsvRows(
  metrics: AggregatedMetrics,
  label: string
): string[][] {
  return [
    ["model", "metric", "value"],
    [label, "attackAttempts", String(metrics.attackAttempts)],
    [label, "successfulUnauthorizedAccess", String(metrics.successfulUnauthorizedAccess)],
    [label, "attackPreventionRate", String(metrics.attackPreventionRate)],
    [label, "detectionRate", String(metrics.detectionRate)],
    [label, "falsePositives", String(metrics.falsePositives)],
    [label, "falseNegatives", String(metrics.falseNegatives)],
    [label, "authLatencyMean", String(metrics.authLatencyMean)],
    [label, "authzLatencyMean", String(metrics.authzLatencyMean)],
    [label, "securityAlerts", String(metrics.securityAlerts)],
    [label, "patientRecordsExposed", String(metrics.patientRecordsExposed)],
    [label, "confidentialityImpactTotal", String(metrics.confidentialityImpactTotal)],
    [label, "integrityImpactTotal", String(metrics.integrityImpactTotal)],
    [label, "availabilityImpactTotal", String(metrics.availabilityImpactTotal)],
    [label, "allowedRequests", String(metrics.allowedRequests)],
    [label, "deniedRequests", String(metrics.deniedRequests)],
  ];
}
