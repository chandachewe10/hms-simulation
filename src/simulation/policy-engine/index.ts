import type { PolicyDecision, RiskAssessment, SensitivityLevel } from "../types";

export interface PolicyInput {
  risk: RiskAssessment;
  resourceSensitivity: SensitivityLevel;
  rolePermitted: boolean;
  authSuccess: boolean;
  connectivityFragile: boolean;
}

export interface PolicyOutput {
  decision: PolicyDecision;
  accessGranted: boolean;
  limitedAccess: boolean;
  stepUpRequired: boolean;
  alertRaised: boolean;
  reasonSummary: string[];
}

export function evaluateZeroTrustPolicy(input: PolicyInput): PolicyOutput {
  const reasons: string[] = [];
  if (!input.authSuccess) {
    return deny("Invalid or incomplete authentication", reasons, true);
  }
  if (!input.rolePermitted) {
    return deny("Least privilege — role not permitted for resource", reasons, true);
  }

  const r = input.risk.score;
  const critical = input.resourceSensitivity === "CRITICAL";

  if (r >= 85 || (critical && r >= 70)) {
    reasons.push(`Risk score ${r} exceeds block threshold`);
    input.risk.factors
      .filter((f) => f.points > 5)
      .slice(0, 4)
      .forEach((f) => reasons.push(`${f.factor}: ${f.detail}`));
    return {
      decision: "ALERT_AND_BLOCK",
      accessGranted: false,
      limitedAccess: false,
      stepUpRequired: false,
      alertRaised: true,
      reasonSummary: reasons,
    };
  }

  if (r >= 65) {
    reasons.push(`High risk (${r}) — deny by default`);
    return deny(reasons.join("; "), reasons, true);
  }

  if (r >= 45 || (critical && r >= 35)) {
    reasons.push(`Elevated risk (${r}) — step-up authentication required`);
    return {
      decision: "STEP_UP_AUTHENTICATION",
      accessGranted: false,
      limitedAccess: false,
      stepUpRequired: true,
      alertRaised: true,
      reasonSummary: reasons,
    };
  }

  if (r >= 30 || input.connectivityFragile) {
    reasons.push(
      input.connectivityFragile
        ? "Limited access due to constrained connectivity + moderate risk"
        : `Moderate risk (${r}) — limited read-only access`
    );
    return {
      decision: "LIMITED_ACCESS",
      accessGranted: true,
      limitedAccess: true,
      stepUpRequired: false,
      alertRaised: r >= 25,
      reasonSummary: reasons,
    };
  }

  reasons.push(`Risk ${r} within acceptable range`);
  return {
    decision: "ALLOW",
    accessGranted: true,
    limitedAccess: false,
    stepUpRequired: false,
    alertRaised: false,
    reasonSummary: reasons,
  };
}

export function evaluateRbacPolicy(input: {
  authSuccess: boolean;
  rolePermitted: boolean;
  onTrustedNetwork: boolean;
}): PolicyOutput {
  const reasons: string[] = [];
  if (!input.authSuccess) {
    return deny("Authentication failed", reasons, false);
  }
  if (input.onTrustedNetwork) {
    reasons.push("Implicit trust: request originates from trusted network");
  }
  if (input.rolePermitted) {
    reasons.push("RBAC role grants permission to resource class");
    return {
      decision: "ALLOW",
      accessGranted: true,
      limitedAccess: false,
      stepUpRequired: false,
      alertRaised: false,
      reasonSummary: reasons,
    };
  }
  reasons.push("Role lacks permission");
  return deny("RBAC deny — role not in policy", reasons, false);
}

function deny(
  msg: string,
  reasons: string[],
  alert: boolean
): PolicyOutput {
  reasons.push(msg);
  return {
    decision: "DENY",
    accessGranted: false,
    limitedAccess: false,
    stepUpRequired: false,
    alertRaised: alert,
    reasonSummary: reasons,
  };
}
