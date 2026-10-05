import type {
  AccessContext,
  AttackScenarioId,
  PresentationScenarioId,
  SimulatedDevice,
  SimulatedResource,
  SimulatedUser,
} from "../types";
import { deviceForUser } from "../devices";

export function buildAttackContext(
  scenario: AttackScenarioId,
  user: SimulatedUser,
  device: SimulatedDevice,
  resource: SimulatedResource,
  baseTime: Date
): AccessContext {
  const common: AccessContext = {
    timestamp: baseTime,
    hourOfDay: baseTime.getHours(),
    location: device.lastSeenLocation,
    networkTrust: 0.85,
    onTrustedNetwork: true,
    deviceId: device.id,
    userId: user.id,
    resourceId: resource.id,
    credentialsValid: true,
    mfaCompleted: user.mfaEnrolled,
    behaviourAnomaly: user.behaviourBaseline,
    isAttack: true,
    attackScenario: scenario,
    sessionAgeMinutes: 30,
  };

  switch (scenario) {
    case "stolen_credentials":
      return {
        ...common,
        credentialsValid: true,
        mfaCompleted: false,
        behaviourAnomaly: 0.75,
        location: "Unknown GeoIP",
        networkTrust: 0.25,
        onTrustedNetwork: false,
        sessionAgeMinutes: 720,
      };
    case "insider_misuse":
      return {
        ...common,
        behaviourAnomaly: 0.85,
        hourOfDay: 2,
        mfaCompleted: user.mfaEnrolled,
      };
    case "unknown_device":
      return {
        ...common,
        deviceId: device.id,
        mfaCompleted: false,
        networkTrust: 0.5,
        onTrustedNetwork: true,
      };
    case "suspicious_network":
      return {
        ...common,
        location: "Public Wi-Fi Lusaka",
        networkTrust: 0.15,
        onTrustedNetwork: false,
        mfaCompleted: user.mfaEnrolled,
      };
    case "excessive_sensitive_access":
      return {
        ...common,
        behaviourAnomaly: 0.7,
        hourOfDay: 23,
      };
    case "remote_low_bandwidth":
      return {
        ...common,
        location: "Rural Outreach Post",
        networkTrust: 0.55,
        onTrustedNetwork: false,
        mfaCompleted: user.mfaEnrolled,
        behaviourAnomaly: 0.25,
      };
    default:
      return common;
  }
}

export function buildLegitimateContext(
  user: SimulatedUser,
  device: SimulatedDevice,
  resource: SimulatedResource,
  baseTime: Date
): AccessContext {
  return {
    timestamp: baseTime,
    hourOfDay: 10 + (baseTime.getHours() % 8),
    location: device.lastSeenLocation,
    networkTrust: device.managed ? 0.9 : 0.65,
    onTrustedNetwork: device.managed,
    deviceId: device.id,
    userId: user.id,
    resourceId: resource.id,
    credentialsValid: true,
    mfaCompleted: user.mfaEnrolled,
    behaviourAnomaly: user.behaviourBaseline,
    isAttack: false,
    sessionAgeMinutes: 15,
  };
}

export function presentationScenario(
  id: PresentationScenarioId,
  users: SimulatedUser[],
  devices: SimulatedDevice[],
  resources: SimulatedResource[]
): {
  user: SimulatedUser;
  device: SimulatedDevice;
  resource: SimulatedResource;
  context: AccessContext;
} {
  const doctor = users.find((u) => u.role === "doctor") ?? users[0];
  const nurse = users.find((u) => u.role === "nurse") ?? users[0];
  const records =
    users.find((u) => u.role === "records_officer") ?? users[0];
  const remote =
    users.find((u) => u.role === "remote_healthcare_worker") ?? users[0];
  const hiv = resources.find((r) => r.kind === "sensitive_hiv_records")!;
  const demo = resources.find((r) => r.kind === "patient_demographics")!;
  const now = new Date("2026-10-05T14:00:00Z");

  switch (id) {
    case "doctor_normal": {
      const device = deviceForUser(devices, doctor.id, true);
      return {
        user: doctor,
        device,
        resource: demo,
        context: buildLegitimateContext(doctor, device, demo, now),
      };
    }
    case "doctor_stolen_credentials": {
      const device = deviceForUser(devices, doctor.id, false);
      return {
        user: doctor,
        device,
        resource: hiv,
        context: buildAttackContext(
          "stolen_credentials",
          doctor,
          device,
          hiv,
          now
        ),
      };
    }
    case "insider_abnormal": {
      const device = deviceForUser(devices, records.id, true);
      return {
        user: records,
        device,
        resource: hiv,
        context: buildAttackContext(
          "insider_misuse",
          records,
          device,
          hiv,
          now
        ),
      };
    }
    case "unknown_device": {
      const device = deviceForUser(devices, nurse.id, false);
      const unmanaged = {
        ...device,
        managed: false,
        trustScore: 20,
        postureScore: 30,
      };
      const resource = resources.find((r) => r.kind === "medical_history")!;
      const context = buildAttackContext(
        "unknown_device",
        nurse,
        unmanaged,
        resource,
        now
      );
      context.resourceId = resource.id;
      return {
        user: nurse,
        device: unmanaged,
        resource,
        context,
      };
    }
    case "suspicious_network": {
      const device = deviceForUser(devices, doctor.id, true);
      return {
        user: doctor,
        device,
        resource: hiv,
        context: buildAttackContext(
          "suspicious_network",
          doctor,
          device,
          hiv,
          now
        ),
      };
    }
    case "remote_low_bandwidth": {
      const device = deviceForUser(devices, remote.id, true);
      return {
        user: remote,
        device,
        resource: demo,
        context: buildAttackContext(
          "remote_low_bandwidth",
          remote,
          device,
          demo,
          now
        ),
      };
    }
    default:
      throw new Error(`Unknown presentation scenario: ${id}`);
  }
}

export const ATTACK_SCENARIO_LABELS: Record<AttackScenarioId, string> = {
  stolen_credentials: "Stolen credentials",
  insider_misuse: "Insider misuse",
  unknown_device: "Unknown / unmanaged device",
  suspicious_network: "Suspicious / untrusted network",
  excessive_sensitive_access: "Excessive access to sensitive records",
  remote_low_bandwidth: "Remote worker — low bandwidth / intermittent",
};

export const PRESENTATION_LABELS: Record<PresentationScenarioId, string> = {
  doctor_normal: "Doctor — Normal Access",
  doctor_stolen_credentials: "Doctor — Stolen Credentials",
  insider_abnormal: "Insider — Abnormal Access",
  unknown_device: "Unknown Device",
  suspicious_network: "Suspicious Network",
  remote_low_bandwidth: "Remote Worker — Low Bandwidth",
};
