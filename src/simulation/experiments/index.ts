import { forkSeed, SeededRng } from "../rng";
import { generateUsers } from "../users";
import { generateDevices } from "../devices";
import { generateResources } from "../resources";
import { authorizeRbac } from "../rbac";
import { authorizeZeroTrust } from "../zero-trust";
import {
  ATTACK_SCENARIO_LABELS,
  buildAttackContext,
  buildLegitimateContext,
} from "../attacks";
import { aggregateMetrics } from "../metrics";
import { DEFAULT_ZAMBIA_NETWORK } from "../network";
import type {
  AccessRequestOutcome,
  AttackScenarioId,
  ExperimentResult,
  ExperimentTrialResult,
  SimulationParameters,
} from "../types";

export const RESEARCH_ASSUMPTIONS = [
  "Users and devices are synthetic; behaviour is approximated with parameterized distributions.",
  "Network latency, packet loss, and bandwidth are configurable inputs—not live measurements from Zambia.",
  "SmartCare is used only as inspiration for resource types and roles; this is not SmartCare production architecture.",
  "Attack scenarios are simulated request patterns, not penetration tests against real systems.",
  "RBAC baseline reflects perimeter trust when onTrustedNetwork is true (common legacy posture).",
];

export const LITERATURE_NOTES = [
  "Zero Trust (NIST SP 800-207) emphasizes continuous verification and least privilege—implemented here as policy rules.",
  "Healthcare PHI protection aligns conceptually with confidentiality goals in HIPAA-like frameworks (used for framing only).",
  "Resource sensitivity tiers (LOW→CRITICAL) mirror common clinical data classification schemes in academic literature.",
];

export const LIMITATIONS = [
  "No formal statistical significance testing is performed unless extended by the researcher.",
  "User behaviour and device posture are modeled; real EMR audit logs would ground parameters empirically.",
  "Single-machine simulation does not capture distributed IAM vendor latency or HSM performance.",
  "Comparison reflects configured policies—not a specific deployed Zambian facility.",
];

export const DEFAULT_SIMULATION_PARAMETERS: SimulationParameters = {
  userCount: 100,
  deviceCount: 100,
  legitimateRequestCount: 1000,
  maliciousRequestCount: 200,
  trials: 3,
  randomSeed: 20261005,
  network: DEFAULT_ZAMBIA_NETWORK,
  deviceTrustBaseline: 0.72,
  userRiskBaseline: 0.35,
  authenticationStrength: 0.65,
};

const ATTACK_TYPES: AttackScenarioId[] = [
  "stolen_credentials",
  "insider_misuse",
  "unknown_device",
  "suspicious_network",
  "excessive_sensitive_access",
  "remote_low_bandwidth",
];

export function runExperiment(
  parameters: SimulationParameters = DEFAULT_SIMULATION_PARAMETERS
): ExperimentResult {
  const trials: ExperimentTrialResult[] = [];

  for (let t = 0; t < parameters.trials; t++) {
    const seed = forkSeed(parameters.randomSeed, t + 1);
    const rng = new SeededRng(seed);
    const users = generateUsers(
      parameters.userCount,
      rng,
      parameters.authenticationStrength,
      parameters.userRiskBaseline
    );
    const devices = generateDevices(
      parameters.deviceCount,
      users,
      rng,
      parameters.deviceTrustBaseline
    );
    const resources = generateResources(120, "ZM-PAT");

    const rbacOutcomes = simulateBatch(
      "traditional_rbac",
      parameters,
      users,
      devices,
      resources,
      rng
    );
    const ztOutcomes = simulateBatch(
      "zero_trust",
      parameters,
      users,
      devices,
      resources,
      rng
    );

    trials.push({ trialIndex: t, model: "traditional_rbac", outcomes: rbacOutcomes });
    trials.push({ trialIndex: t, model: "zero_trust", outcomes: ztOutcomes });
  }

  const rbacAll = trials
    .filter((t) => t.model === "traditional_rbac")
    .flatMap((t) => t.outcomes);
  const ztAll = trials
    .filter((t) => t.model === "zero_trust")
    .flatMap((t) => t.outcomes);

  const rbacMetrics = aggregateMetrics("traditional_rbac", rbacAll);
  const ztMetrics = aggregateMetrics("zero_trust", ztAll);

  return {
    parameters,
    assumptions: RESEARCH_ASSUMPTIONS,
    literatureNotes: LITERATURE_NOTES,
    limitations: LIMITATIONS,
    trials,
    metricsByModel: {
      traditional_rbac: rbacMetrics,
      zero_trust: ztMetrics,
    },
    comparisonInterpretation: interpretComparison(rbacMetrics, ztMetrics),
  };
}

function simulateBatch(
  model: "traditional_rbac" | "zero_trust",
  parameters: SimulationParameters,
  users: ReturnType<typeof generateUsers>,
  devices: ReturnType<typeof generateDevices>,
  resources: ReturnType<typeof generateResources>,
  rng: SeededRng
): AccessRequestOutcome[] {
  const outcomes: AccessRequestOutcome[] = [];
  const baseTime = new Date("2026-10-01T08:00:00Z");

  for (let i = 0; i < parameters.legitimateRequestCount; i++) {
    const user = rng.pick(users);
    const device = rng.pick(devices.filter((d) => d.userId === user.id).length
      ? devices.filter((d) => d.userId === user.id)
      : devices);
    const resource = rng.pick(resources);
    const ctx = buildLegitimateContext(
      user,
      device,
      resource,
      new Date(baseTime.getTime() + i * 60000)
    );
    outcomes.push(
      model === "traditional_rbac"
        ? authorizeRbac(user, device, resource, ctx, parameters.network)
        : authorizeZeroTrust(user, device, resource, ctx, parameters.network)
    );
  }

  for (let i = 0; i < parameters.maliciousRequestCount; i++) {
    const scenario = ATTACK_TYPES[i % ATTACK_TYPES.length];
    const user = rng.pick(users);
    let device = rng.pick(devices);
    if (scenario === "unknown_device") {
      device = { ...device, managed: false, trustScore: 15, postureScore: 25 };
    }
    const resource =
      scenario === "excessive_sensitive_access"
        ? rng.pick(
            resources.filter(
              (r) =>
                r.sensitivity === "CRITICAL" || r.sensitivity === "HIGH"
            )
          )
        : rng.pick(resources);
    const ctx = buildAttackContext(
      scenario,
      user,
      device,
      resource,
      new Date(baseTime.getTime() + (parameters.legitimateRequestCount + i) * 60000)
    );
    if (scenario === "insider_misuse" && user.role === "it_administrator") {
      ctx.behaviourAnomaly = 0.9;
    }
    outcomes.push(
      model === "traditional_rbac"
        ? authorizeRbac(user, device, resource, ctx, parameters.network)
        : authorizeZeroTrust(user, device, resource, ctx, parameters.network)
    );
  }

  return outcomes;
}

function interpretComparison(
  rbac: ReturnType<typeof aggregateMetrics>,
  zt: ReturnType<typeof aggregateMetrics>
): string[] {
  const lines: string[] = [];
  lines.push(
    `Under identical synthetic traffic (${rbac.attackAttempts} attack attempts per model across trials), Zero Trust prevented ${zt.attackPreventionRate}% vs RBAC ${rbac.attackPreventionRate}% (simulation output—not a field claim).`
  );
  lines.push(
    `Unauthorized successful access events: RBAC ${rbac.successfulUnauthorizedAccess}, Zero Trust ${zt.successfulUnauthorizedAccess}.`
  );
  lines.push(
    `Mean authorization latency: RBAC ${rbac.authzLatencyMean.toFixed(1)} ms vs Zero Trust ${zt.authzLatencyMean.toFixed(1)} ms (includes configured Zambia network penalties).`
  );
  lines.push(
    `False positives (legitimate denied): RBAC ${rbac.falsePositives}, Zero Trust ${zt.falsePositives}.`
  );
  lines.push(
    "These results test the research hypothesis in silico; external validity requires facility-specific calibration."
  );
  return lines;
}

export { ATTACK_SCENARIO_LABELS };
