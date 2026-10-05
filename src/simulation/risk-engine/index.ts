import { sensitivityWeight } from "../resources";
import type {
  AccessContext,
  RiskAssessment,
  RiskFactorContribution,
  SimulatedDevice,
  SimulatedResource,
  SimulatedUser,
} from "../types";

export function computeRiskScore(
  user: SimulatedUser,
  device: SimulatedDevice,
  resource: SimulatedResource,
  context: AccessContext
): RiskAssessment {
  const factors: RiskFactorContribution[] = [];

  const postureGap = Math.max(0, 100 - device.postureScore);
  const posturePts = (postureGap / 100) * 18;
  factors.push({
    factor: "Device posture",
    points: round(posturePts),
    detail: `Posture score ${device.postureScore.toFixed(0)}/100`,
  });

  const deviceTrustPts = (100 - device.trustScore) * 0.15;
  factors.push({
    factor: "Device trust",
    points: round(deviceTrustPts),
    detail: device.managed ? "Managed device" : "Unmanaged / unknown device",
  });

  const locationPts =
    context.location.includes("Unknown") || context.location.includes("Public")
      ? 14
      : context.location.includes("Rural")
        ? 4
        : 2;
  factors.push({
    factor: "Location",
    points: locationPts,
    detail: context.location,
  });

  const networkPts = (1 - context.networkTrust) * 16;
  factors.push({
    factor: "Network trust",
    points: round(networkPts),
    detail: context.onTrustedNetwork
      ? "Hospital/trusted network"
      : "Untrusted or external network",
  });

  const hour = context.hourOfDay;
  const offHours = hour < 6 || hour > 20;
  const timePts = offHours ? 8 : 1;
  factors.push({
    factor: "Time of access",
    points: timePts,
    detail: offHours ? "Outside typical clinical hours" : "Within clinical hours",
  });

  const behaviourPts = context.behaviourAnomaly * 20 + user.riskScore * 0.08;
  factors.push({
    factor: "Behaviour / anomaly",
    points: round(behaviourPts),
    detail: `Anomaly ${(context.behaviourAnomaly * 100).toFixed(0)}%, user risk ${user.riskScore.toFixed(0)}`,
  });

  const resourcePts = sensitivityWeight(resource.sensitivity) * 0.9;
  factors.push({
    factor: "Resource sensitivity",
    points: round(resourcePts),
    detail: `${resource.sensitivity} — ${resource.label}`,
  });

  if (context.mfaCompleted) {
    factors.push({
      factor: "MFA completed",
      points: -12,
      detail: "Simulated MFA satisfied",
    });
  }

  if (context.sessionAgeMinutes > 480) {
    factors.push({
      factor: "Stale session",
      points: 10,
      detail: `Session age ${context.sessionAgeMinutes} min`,
    });
  }

  if (!context.credentialsValid) {
    factors.push({
      factor: "Invalid credentials",
      points: 40,
      detail: "Authentication failed or stolen credential pattern",
    });
  }

  const score = Math.min(
    100,
    Math.max(0, factors.reduce((sum, f) => sum + f.points, 0))
  );

  return { score: round(score), factors };
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
