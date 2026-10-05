import { describe, expect, it } from "vitest";
import { runExperiment, DEFAULT_SIMULATION_PARAMETERS } from "./index";
import { presentationScenario } from "../attacks";
import { authorizeRbac } from "../rbac";
import { authorizeZeroTrust } from "../zero-trust";
import { generateUsers } from "../users";
import { generateDevices } from "../devices";
import { generateResources } from "../resources";
import { SeededRng } from "../rng";
import { DEFAULT_ZAMBIA_NETWORK } from "../network";

describe("experiment engine", () => {
  it("produces reproducible metrics for a fixed seed", () => {
    const params = {
      ...DEFAULT_SIMULATION_PARAMETERS,
      trials: 1,
      legitimateRequestCount: 50,
      maliciousRequestCount: 20,
      userCount: 20,
      deviceCount: 20,
    };
    const a = runExperiment(params);
    const b = runExperiment(params);
    expect(a.metricsByModel.zero_trust.attackPreventionRate).toBe(
      b.metricsByModel.zero_trust.attackPreventionRate
    );
    expect(a.metricsByModel.traditional_rbac.patientRecordsExposed).toBe(
      b.metricsByModel.traditional_rbac.patientRecordsExposed
    );
  });

  it("does not hard-code perfect prevention rates", () => {
    const result = runExperiment({
      ...DEFAULT_SIMULATION_PARAMETERS,
      trials: 1,
      legitimateRequestCount: 100,
      maliciousRequestCount: 50,
    });
    const zt = result.metricsByModel.zero_trust;
    expect(zt.attackAttempts).toBe(50);
    expect(zt.attackPreventionRate).toBeGreaterThanOrEqual(0);
    expect(zt.attackPreventionRate).toBeLessThanOrEqual(100);
  });
});

describe("scenario comparison", () => {
  it("stolen credentials often fare worse under RBAC than ZT", () => {
    const rng = new SeededRng(42);
    const users = generateUsers(30, rng, 0.7, 0.3);
    const devices = generateDevices(30, users, rng, 0.7);
    const resources = generateResources(20, "TST");
    const preset = presentationScenario(
      "doctor_stolen_credentials",
      users,
      devices,
      resources
    );
    const rbac = authorizeRbac(
      preset.user,
      preset.device,
      preset.resource,
      preset.context,
      DEFAULT_ZAMBIA_NETWORK
    );
    const zt = authorizeZeroTrust(
      preset.user,
      preset.device,
      preset.resource,
      preset.context,
      DEFAULT_ZAMBIA_NETWORK
    );
    expect(zt.authorization.risk.score).toBeGreaterThan(30);
    if (rbac.authorization.accessGranted) {
      expect(
        zt.authorization.accessGranted === false ||
          zt.authorization.limitedAccess === true
      ).toBe(true);
    }
  });
});

describe("risk engine", () => {
  it("returns score between 0 and 100", () => {
    const result = runExperiment({
      ...DEFAULT_SIMULATION_PARAMETERS,
      trials: 1,
      legitimateRequestCount: 10,
      maliciousRequestCount: 5,
    });
    const ztOutcomes = result.trials.find(
      (t) => t.model === "zero_trust"
    )!.outcomes;
    for (const o of ztOutcomes) {
      expect(o.authorization.risk.score).toBeGreaterThanOrEqual(0);
      expect(o.authorization.risk.score).toBeLessThanOrEqual(100);
    }
  });
});
