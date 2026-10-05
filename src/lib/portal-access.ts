import { presentationScenario } from "@/simulation/attacks";
import { authorizeRbac } from "@/simulation/rbac";
import { authorizeZeroTrust } from "@/simulation/zero-trust";
import { generateUsers } from "@/simulation/users";
import { generateDevices } from "@/simulation/devices";
import { generateResources } from "@/simulation/resources";
import { SeededRng } from "@/simulation/rng";
import { DEFAULT_SIMULATION_PARAMETERS } from "@/simulation/experiments";
import type {
  AccessRequestOutcome,
  PresentationScenarioId,
} from "@/simulation/types";

const world = () => {
  const rng = new SeededRng(DEFAULT_SIMULATION_PARAMETERS.randomSeed);
  const users = generateUsers(40, rng, 0.65, 0.35);
  const devices = generateDevices(40, users, rng, 0.72);
  const resources = generateResources(40, "ZM-PAT");
  return { users, devices, resources };
};

let cached: ReturnType<typeof world> | null = null;
function getWorld() {
  if (!cached) cached = world();
  return cached;
}

export function runPresentationAttack(
  scenario: PresentationScenarioId
): { traditional: AccessRequestOutcome; zeroTrust: AccessRequestOutcome } {
  const { users, devices, resources } = getWorld();
  const preset = presentationScenario(scenario, users, devices, resources);
  const network = DEFAULT_SIMULATION_PARAMETERS.network;
  return {
    traditional: authorizeRbac(
      preset.user,
      preset.device,
      preset.resource,
      preset.context,
      network
    ),
    zeroTrust: authorizeZeroTrust(
      preset.user,
      preset.device,
      preset.resource,
      preset.context,
      network
    ),
  };
}

export const ATTACK_BUTTONS: {
  id: PresentationScenarioId;
  label: string;
  description: string;
}[] = [
  {
    id: "doctor_stolen_credentials",
    label: "Stolen credentials",
    description: "Valid password from an unknown location without MFA.",
  },
  {
    id: "insider_abnormal",
    label: "Insider abnormal access",
    description: "Off-hours bulk access to sensitive HIV-related records.",
  },
  {
    id: "unknown_device",
    label: "Unknown device",
    description: "Unmanaged personal device on the hospital VLAN.",
  },
  {
    id: "suspicious_network",
    label: "Suspicious network",
    description: "Session from public Wi-Fi attempting critical PHI.",
  },
  {
    id: "remote_low_bandwidth",
    label: "Remote low bandwidth",
    description: "Rural outreach worker on degraded connectivity.",
  },
];
