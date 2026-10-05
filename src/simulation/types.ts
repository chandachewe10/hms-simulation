/** Core types for the SmartCare-inspired academic simulation (not production SmartCare). */

export type UserRole =
  | "doctor"
  | "nurse"
  | "records_officer"
  | "lab_technician"
  | "pharmacist"
  | "administrator"
  | "it_administrator"
  | "remote_healthcare_worker";

export type ResourceKind =
  | "patient_demographics"
  | "medical_history"
  | "laboratory_results"
  | "prescriptions"
  | "sensitive_hiv_records"
  | "billing"
  | "emr_administration";

export type SensitivityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type SecurityModel = "traditional_rbac" | "zero_trust";

export type PolicyDecision =
  | "ALLOW"
  | "DENY"
  | "STEP_UP_AUTHENTICATION"
  | "LIMITED_ACCESS"
  | "ALERT_AND_BLOCK";

export type AttackScenarioId =
  | "stolen_credentials"
  | "insider_misuse"
  | "unknown_device"
  | "suspicious_network"
  | "excessive_sensitive_access"
  | "remote_low_bandwidth";

export type PresentationScenarioId =
  | "doctor_normal"
  | "doctor_stolen_credentials"
  | "insider_abnormal"
  | "unknown_device"
  | "suspicious_network"
  | "remote_low_bandwidth";

export interface ZambiaNetworkConditions {
  latencyMs: number;
  packetLossPercent: number;
  bandwidthKbps: number;
  simultaneousUsers: number;
}

export interface SimulationParameters {
  userCount: number;
  deviceCount: number;
  legitimateRequestCount: number;
  maliciousRequestCount: number;
  trials: number;
  randomSeed: number;
  network: ZambiaNetworkConditions;
  /** 0–1 baseline device trust in population */
  deviceTrustBaseline: number;
  /** 0–1 baseline user risk in population */
  userRiskBaseline: number;
  /** 0–1 authentication strength (MFA coverage for ZT) */
  authenticationStrength: number;
}

export interface SimulatedUser {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  riskScore: number;
  behaviourBaseline: number;
  mfaEnrolled: boolean;
  facilityId: string;
}

export interface SimulatedDevice {
  id: string;
  userId: string;
  name: string;
  managed: boolean;
  postureScore: number;
  trustScore: number;
  lastSeenLocation: string;
}

export interface SimulatedResource {
  id: string;
  kind: ResourceKind;
  sensitivity: SensitivityLevel;
  patientId: string;
  label: string;
}

export interface AccessContext {
  timestamp: Date;
  hourOfDay: number;
  location: string;
  networkTrust: number;
  onTrustedNetwork: boolean;
  deviceId: string;
  userId: string;
  resourceId: string;
  credentialsValid: boolean;
  mfaCompleted: boolean;
  behaviourAnomaly: number;
  isAttack: boolean;
  attackScenario?: AttackScenarioId;
  sessionAgeMinutes: number;
}

export interface RiskFactorContribution {
  factor: string;
  points: number;
  detail: string;
}

export interface RiskAssessment {
  score: number;
  factors: RiskFactorContribution[];
}

export interface AuthResult {
  success: boolean;
  latencyMs: number;
  method: string;
}

export interface AuthorizationResult {
  decision: PolicyDecision;
  risk: RiskAssessment;
  latencyMs: number;
  recordsExposed: number;
  confidentialityImpact: number;
  integrityImpact: number;
  availabilityImpact: number;
  alertRaised: boolean;
  sessionCompromised: boolean;
  accessGranted: boolean;
  limitedAccess: boolean;
  stepUpRequired: boolean;
  detectionEvent: boolean;
  preventionEvent: boolean;
  reasonSummary: string[];
}

export interface AccessRequestOutcome {
  requestId: string;
  model: SecurityModel;
  user: SimulatedUser;
  device: SimulatedDevice;
  resource: SimulatedResource;
  context: AccessContext;
  authentication: AuthResult;
  authorization: AuthorizationResult;
  pipeline: string[];
}

export interface ExperimentTrialResult {
  trialIndex: number;
  model: SecurityModel;
  outcomes: AccessRequestOutcome[];
}

export interface AggregatedMetrics {
  model: SecurityModel;
  attackAttempts: number;
  successfulUnauthorizedAccess: number;
  attackPreventionRate: number;
  detectionRate: number;
  falsePositives: number;
  falseNegatives: number;
  authLatencyMean: number;
  authLatencyMedian: number;
  authLatencyStdDev: number;
  authzLatencyMean: number;
  authzLatencyMedian: number;
  authzLatencyStdDev: number;
  policyDecisionTimeMean: number;
  securityAlerts: number;
  compromisedSessions: number;
  patientRecordsExposed: number;
  confidentialityImpactTotal: number;
  integrityImpactTotal: number;
  availabilityImpactTotal: number;
  allowedRequests: number;
  deniedRequests: number;
  riskScores: number[];
}

export interface ExperimentResult {
  parameters: SimulationParameters;
  assumptions: string[];
  literatureNotes: string[];
  limitations: string[];
  trials: ExperimentTrialResult[];
  metricsByModel: Record<SecurityModel, AggregatedMetrics>;
  comparisonInterpretation: string[];
}

export interface ScenarioComparison {
  scenario: PresentationScenarioId;
  label: string;
  traditional: AccessRequestOutcome;
  zeroTrust: AccessRequestOutcome;
}
