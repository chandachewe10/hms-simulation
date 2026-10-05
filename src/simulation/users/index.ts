import type { SimulatedUser, UserRole } from "../types";
import type { SeededRng } from "../rng";

const ROLES: UserRole[] = [
  "doctor",
  "nurse",
  "records_officer",
  "lab_technician",
  "pharmacist",
  "administrator",
  "it_administrator",
  "remote_healthcare_worker",
];

const FIRST = [
  "Chanda",
  "Mutale",
  "Bwalya",
  "Namukolo",
  "Mumba",
  "Kabwe",
  "Lubinda",
  "Nchimunya",
  "Thandiwe",
  "Mwansa",
];
const LAST = [
  "Phiri",
  "Banda",
  "Tembo",
  "Zulu",
  "Sakala",
  "Mulenga",
  "Chileshe",
  "Ng'andu",
  "Daka",
  " Lungu",
];

const DEPTS: Record<UserRole, string> = {
  doctor: "Clinical Services",
  nurse: "Ward Care",
  records_officer: "Health Records",
  lab_technician: "Laboratory",
  pharmacist: "Pharmacy",
  administrator: "Hospital Administration",
  it_administrator: "Health IT",
  remote_healthcare_worker: "Community Outreach",
};

export function generateUsers(
  count: number,
  rng: SeededRng,
  authStrength: number,
  userRiskBaseline: number
): SimulatedUser[] {
  const users: SimulatedUser[] = [];
  for (let i = 0; i < count; i++) {
    const role = ROLES[i % ROLES.length];
    const name = `${rng.pick(FIRST)} ${rng.pick(LAST).trim()}`;
    const riskScore = Math.min(
      100,
      Math.max(0, rng.normal(userRiskBaseline * 40, 12))
    );
    users.push({
      id: `user-${i}`,
      name,
      role,
      department: DEPTS[role],
      riskScore,
      behaviourBaseline: rng.normal(0.2, 0.08),
      mfaEnrolled: rng.bool(authStrength),
      facilityId: i % 3 === 0 ? "facility-rural" : "facility-urban-lusaka",
    });
  }
  return users;
}

/** RBAC role → allowed resource kinds (perimeter model — often broad). */
export function rbacPermissions(role: UserRole): Set<string> {
  const base = new Set([
    "patient_demographics",
    "medical_history",
    "laboratory_results",
    "prescriptions",
    "billing",
  ]);
  switch (role) {
    case "records_officer":
    case "administrator":
      base.add("sensitive_hiv_records");
      base.add("emr_administration");
      break;
    case "it_administrator":
      base.add("emr_administration");
      break;
    case "doctor":
    case "nurse":
      base.add("laboratory_results");
      break;
    default:
      break;
  }
  if (role === "pharmacist") {
    base.delete("medical_history");
    base.add("prescriptions");
  }
  return base;
}

/** Least-privilege intent for Zero Trust (narrower than RBAC). */
export function zeroTrustAllowedKinds(role: UserRole): Set<string> {
  const set = new Set<string>();
  switch (role) {
    case "doctor":
      set.add("patient_demographics");
      set.add("medical_history");
      set.add("laboratory_results");
      set.add("prescriptions");
      break;
    case "nurse":
      set.add("patient_demographics");
      set.add("medical_history");
      set.add("prescriptions");
      break;
    case "records_officer":
      set.add("patient_demographics");
      set.add("billing");
      break;
    case "lab_technician":
      set.add("laboratory_results");
      set.add("patient_demographics");
      break;
    case "pharmacist":
      set.add("prescriptions");
      set.add("patient_demographics");
      break;
    case "administrator":
      set.add("billing");
      set.add("patient_demographics");
      break;
    case "it_administrator":
      set.add("emr_administration");
      break;
    case "remote_healthcare_worker":
      set.add("patient_demographics");
      set.add("prescriptions");
      break;
  }
  return set;
}
