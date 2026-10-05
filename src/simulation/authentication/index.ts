import type { AccessContext, AuthResult, SecurityModel, SimulatedUser } from "../types";
import type { ZambiaNetworkConditions } from "../types";
import { networkDelayMs } from "../network";

export function authenticate(
  model: SecurityModel,
  user: SimulatedUser,
  context: AccessContext,
  network: ZambiaNetworkConditions
): AuthResult {
  const net = networkDelayMs(network);
  const pipelineLatency =
    model === "zero_trust"
      ? net + (context.mfaCompleted ? 80 : 40)
      : net * 0.6 + 25;

  if (!context.credentialsValid) {
    return {
      success: false,
      latencyMs: pipelineLatency,
      method:
        model === "zero_trust"
          ? "Password + continuous session check"
          : "Username/password",
    };
  }

  if (model === "traditional_rbac") {
    return {
      success: true,
      latencyMs: pipelineLatency,
      method: "Username/password (single factor)",
    };
  }

  const mfaRequired = user.mfaEnrolled || context.mfaCompleted;
  const mfaOk = context.mfaCompleted || (mfaRequired && user.mfaEnrolled);
  if (user.mfaEnrolled && !context.mfaCompleted && context.isAttack) {
    return {
      success: false,
      latencyMs: pipelineLatency + 50,
      method: "Password + MFA (simulated — step-up pending)",
    };
  }

  return {
    success: mfaOk || !user.mfaEnrolled,
    latencyMs: pipelineLatency,
    method: user.mfaEnrolled
      ? "Password + simulated MFA"
      : "Password (MFA not enrolled)",
  };
}
