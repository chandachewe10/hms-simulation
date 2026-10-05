import { authenticate } from "../authentication";
import { evaluateRbacPolicy } from "../policy-engine";
import { rbacPermissions } from "../users";
import { networkDelayMs } from "../network";
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

const MODEL: SecurityModel = "traditional_rbac";

export function authorizeRbac(
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
      ? "Authentication → SUCCESS (password)"
      : "Authentication → FAILED"
  );

  pipeline.push("Context Evaluation → Minimal (trusted network flag only)");
  const rolePermitted = rbacPermissions(user.role).has(resource.kind);
  const policy = evaluateRbacPolicy({
    authSuccess: authentication.success,
    rolePermitted,
    onTrustedNetwork: context.onTrustedNetwork,
  });

  pipeline.push(`Risk Score → N/A (not computed in perimeter model)`);
  pipeline.push(`Policy Decision → ${policy.decision}`);
  pipeline.push(
    `Resource Access → ${policy.accessGranted ? "GRANTED" : "DENIED"}`
  );

  const recordsExposed = policy.accessGranted ? exposureUnits(resource) : 0;
  const unauthorized =
    context.isAttack && policy.accessGranted && isExcessiveAccess(user, resource);

  pipeline.push(
    policy.alertRaised || unauthorized
      ? "Security Alert → Optional SIEM (often none in baseline RBAC)"
      : "Security Alert → None"
  );

  const authzLatency = networkDelayMs(network) * 0.3 + 8;

  const authorization: AuthorizationResult = {
    decision: policy.decision,
    risk: { score: 0, factors: [] },
    latencyMs: authzLatency,
    recordsExposed: unauthorized ? recordsExposed : policy.accessGranted ? recordsExposed : 0,
    confidentialityImpact: policy.accessGranted
      ? confidentialityFor(resource, unauthorized)
      : 0,
    integrityImpact: policy.accessGranted && unauthorized ? 0.4 : 0,
    availabilityImpact: 0,
    alertRaised: policy.alertRaised,
    sessionCompromised: context.isAttack && policy.accessGranted,
    accessGranted: policy.accessGranted,
    limitedAccess: false,
    stepUpRequired: false,
    detectionEvent: false,
    preventionEvent: !policy.accessGranted && context.isAttack,
    reasonSummary: policy.reasonSummary,
  };

  return {
    requestId: context.resourceId + context.userId + context.deviceId,
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
  breach: boolean
): number {
  if (!breach) return 0.1;
  switch (resource.sensitivity) {
    case "CRITICAL":
      return 1;
    case "HIGH":
      return 0.7;
    case "MEDIUM":
      return 0.4;
    default:
      return 0.2;
  }
}

function isExcessiveAccess(
  user: SimulatedUser,
  resource: SimulatedResource
): boolean {
  if (resource.sensitivity === "CRITICAL" && user.role === "nurse") return true;
  if (resource.kind === "sensitive_hiv_records" && user.role === "doctor")
    return false;
  if (resource.kind === "emr_administration" && user.role !== "it_administrator")
    return true;
  return false;
}
