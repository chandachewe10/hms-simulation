import type { ResourceKind, SimulatedResource, SensitivityLevel } from "../types";

export const RESOURCE_META: Record<
  ResourceKind,
  { label: string; sensitivity: SensitivityLevel }
> = {
  patient_demographics: { label: "Patient demographics", sensitivity: "MEDIUM" },
  medical_history: { label: "Medical history", sensitivity: "HIGH" },
  laboratory_results: { label: "Laboratory results", sensitivity: "HIGH" },
  prescriptions: { label: "Prescriptions", sensitivity: "MEDIUM" },
  sensitive_hiv_records: {
    label: "Sensitive / HIV-related records",
    sensitivity: "CRITICAL",
  },
  billing: { label: "Billing", sensitivity: "LOW" },
  emr_administration: { label: "EMR administration", sensitivity: "CRITICAL" },
};

const KINDS = Object.keys(RESOURCE_META) as ResourceKind[];

export function generateResources(
  count: number,
  patientPrefix: string
): SimulatedResource[] {
  const resources: SimulatedResource[] = [];
  for (let i = 0; i < count; i++) {
    const kind = KINDS[i % KINDS.length];
    const meta = RESOURCE_META[kind];
    const patientId = `${patientPrefix}-${String(i % 50).padStart(4, "0")}`;
    resources.push({
      id: `res-${i}`,
      kind,
      sensitivity: meta.sensitivity,
      patientId,
      label: `${meta.label} (${patientId})`,
    });
  }
  return resources;
}

export function sensitivityWeight(level: SensitivityLevel): number {
  switch (level) {
    case "LOW":
      return 5;
    case "MEDIUM":
      return 12;
    case "HIGH":
      return 20;
    case "CRITICAL":
      return 30;
    default:
      return 10;
  }
}
