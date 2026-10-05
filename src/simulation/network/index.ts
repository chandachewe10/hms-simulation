import type { ZambiaNetworkConditions } from "../types";

/** Models connectivity constraints common in Zambian healthcare outreach (simulation parameter). */

export function networkDelayMs(conditions: ZambiaNetworkConditions): number {
  const base = conditions.latencyMs;
  const lossPenalty =
    conditions.packetLossPercent > 0
      ? (conditions.packetLossPercent / 100) * conditions.latencyMs * 2
      : 0;
  const bandwidthPenalty =
    conditions.bandwidthKbps < 512
      ? ((512 - conditions.bandwidthKbps) / 512) * 120
      : 0;
  const congestion =
    conditions.simultaneousUsers > 50
      ? (conditions.simultaneousUsers - 50) * 1.5
      : 0;
  return base + lossPenalty + bandwidthPenalty + congestion;
}

export function availabilityImpactFromNetwork(
  conditions: ZambiaNetworkConditions
): number {
  let impact = 0;
  if (conditions.packetLossPercent > 5) impact += 0.2;
  if (conditions.bandwidthKbps < 256) impact += 0.35;
  if (conditions.latencyMs > 400) impact += 0.25;
  return Math.min(1, impact);
}

export const DEFAULT_ZAMBIA_NETWORK: ZambiaNetworkConditions = {
  latencyMs: 180,
  packetLossPercent: 2,
  bandwidthKbps: 1024,
  simultaneousUsers: 40,
};
