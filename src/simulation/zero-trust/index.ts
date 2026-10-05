import { authenticate } from "../authentication";
import { computeRiskScore } from "../risk-engine";
import { evaluateZeroTrustPolicy } from "../policy-engine";
import { zeroTrustAllowedKinds } from "../users";
import { networkDelayMs, availabilityImpactFromNetwork } from "../network";
import type {
  AccessContext,
  AccessRequestOutcome,
  AuthorizationResult,
  SecurityModel,
  SimulatedDevice,
  SimulatedResource,
  SimulatedUser,
  ZambiaNetworkConditions,
} from "../types";

const MODEL: SecurityModel = "zero_trust";

export function authorizeZeroTrust(
  user: SimulatedUser,
  device: SimulatedDevice,
  resource: SimulatedResource,
  context: AccessContext,
  network: ZambiaNetworkConditions
): AccessRequestOutcome {
  const pipeline: string[] = ["Attack → Authentication"];
  const authentication = authenticate(MODEL, user, context, network);
  pipeline.push(
    authentication.success
      ? "Authentication → SUCCESS (password + session validation)"
      : "Authentication → FAILED / step-up"
  );

  pipeline.push(
    "Context Evaluation → Device, location, network, time, behaviour, sensitivity"
  );
  const risk = computeRiskScore(user, device, resource, context);
  pipeline.push(`Risk Score → ${risk.score}/100`);
  risk.factors
    .filter((f) => Math.abs(f.points) >= 3)
    .slice(0, 5)
    .forEach((f) => pipeline.push(`  • ${f.factor}: +${f.points}`));

  const rolePermitted = zeroTrustAllowedKinds(user.role).has(resource.kind);
  const fragile =
    network.bandwidthKbps < 512 || network.packetLossPercent > 4;

  const policy = evaluateZeroTrustPolicy({
    risk,
    resourceSensitivity: resource.sensitivity,
    rolePermitted,
    authSuccess: authentication.success,
    connectivityFragile: fragile,
  });

  pipeline.push(`Policy Decision → ${policy.decision}`);
  const granted = policy.accessGranted;
  pipeline.push(`Resource Access → ${granted ? (policy.limitedAccess ? "LIMITED" : "GRANTED") : "DENIED"}`);

  const attackBlocked = context.isAttack && !granted;
  const attackDetected =
    context.isAttack &&
    (policy.alertRaised || !granted || policy.stepUpRequired);

  pipeline.push(
    policy.alertRaised
      ? "Security Alert → SOC notification + session flag"
      : attackBlocked
        ? "Security Alert → Prevented access logged"
        : "Security Alert → None"
  );

  const authzLatency =
    networkDelayMs(network) * 0.85 +
    25 +
    risk.factors.length * 2;

  const recordsExposed = granted
    ? policy.limitedAccess
      ? Math.ceil(exposureUnits(resource) / 2)
      : exposureUnits(resource)
    : 0;

  const unauthorizedSuccess =
    context.isAttack && granted && !policy.limitedAccess;

  const authorization: AuthorizationResult = {
    decision: policy.decision,
    risk,
    latencyMs: authzLatency,
    recordsExposed: unauthorizedSuccess || (context.isAttack && granted)
      ? recordsExposed
      : granted
        ? recordsExposed
        : 0,
    confidentialityImpact: granted
      ? confidentialityFor(resource, context.isAttack, policy.limitedAccess)
      : 0,
    integrityImpact:
      context.isAttack && granted && !policy.limitedAccess ? 0.5 : 0,
    availabilityImpact: fragile
      ? availabilityImpactFromNetwork(network) * (policy.stepUpRequired ? 0.5 : 0.2)
      : 0,
    alertRaised: policy.alertRaised,
    sessionCompromised:
      context.isAttack && granted && !policy.limitedAccess,
    accessGranted: granted,
    limitedAccess: policy.limitedAccess,
    stepUpRequired: policy.stepUpRequired,
    detectionEvent: context.isAttack && attackDetected,
    preventionEvent: context.isAttack && attackBlocked,
    reasonSummary: policy.reasonSummary,
  };

  return {
    requestId: `${context.userId}-${context.deviceId}-${context.resourceId}-${context.timestamp.getTime()}`,
    model: MODEL,
    user,
    device,
    resource,
    context,
    authentication,
    authorization,
    pipeline,
  };
}

function exposureUnits(resource: SimulatedResource): number {
  switch (resource.sensitivity) {
    case "CRITICAL":
      return 5;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    default:
      return 1;
  }
}

function confidentialityFor(
  resource: SimulatedResource,
  isAttack: boolean,
  limited: boolean
): number {
  const base =
    resource.sensitivity === "CRITICAL"
      ? 0.9
      : resource.sensitivity === "HIGH"
        ? 0.6
        : 0.3;
  if (!isAttack) return base * 0.15;
  return limited ? base * 0.35 : base;
}
