"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AggregatedMetrics, ExperimentResult } from "@/simulation/types";

type Props = { result: ExperimentResult | null };

export function MetricsCharts({ result }: Props) {
  if (!result) {
    return (
      <p className="text-slate-500 text-sm py-8 text-center">
        Run the experiment to populate charts from simulation output.
      </p>
    );
  }

  const rbac = result.metricsByModel.traditional_rbac;
  const zt = result.metricsByModel.zero_trust;

  const preventionData = [
    {
      name: "Attack prevention %",
      RBAC: rbac.attackPreventionRate,
      ZeroTrust: zt.attackPreventionRate,
    },
    {
      name: "Detection rate %",
      RBAC: rbac.detectionRate,
      ZeroTrust: zt.detectionRate,
    },
  ];

  const exposureData = [
    {
      model: "Traditional RBAC",
      records: rbac.patientRecordsExposed,
      unauthorized: rbac.successfulUnauthorizedAccess,
    },
    {
      model: "Zero Trust",
      records: zt.patientRecordsExposed,
      unauthorized: zt.successfulUnauthorizedAccess,
    },
  ];

  const ciaData = [
    {
      model: "RBAC",
      C: rbac.confidentialityImpactTotal,
      I: rbac.integrityImpactTotal,
      A: rbac.availabilityImpactTotal,
    },
    {
      model: "Zero Trust",
      C: zt.confidentialityImpactTotal,
      I: zt.integrityImpactTotal,
      A: zt.availabilityImpactTotal,
    },
  ];

  const latencyData = [
    {
      model: "RBAC",
      auth: rbac.authLatencyMean,
      authz: rbac.authzLatencyMean,
    },
    {
      model: "Zero Trust",
      auth: zt.authLatencyMean,
      authz: zt.authzLatencyMean,
    },
  ];

  const allowDeny = [
    { model: "RBAC", Allowed: rbac.allowedRequests, Denied: rbac.deniedRequests },
    {
      model: "Zero Trust",
      Allowed: zt.allowedRequests,
      Denied: zt.deniedRequests,
    },
  ];

  const alerts = [
    { model: "RBAC", alerts: rbac.securityAlerts },
    { model: "Zero Trust", alerts: zt.securityAlerts },
  ];

  const riskBuckets = bucketRisk(zt.riskScores);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <ChartCard title="Attack prevention & detection (%)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={preventionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Legend />
            <Bar dataKey="RBAC" fill="#f87171" />
            <Bar dataKey="ZeroTrust" fill="#2dd4bf" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Unauthorized records exposed (attacks)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={exposureData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Legend />
            <Bar dataKey="records" fill="#fb923c" name="Record units exposed" />
            <Bar dataKey="unauthorized" fill="#ef4444" name="Successful unauthorized" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="CIA impact totals (simulation units)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ciaData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Legend />
            <Bar dataKey="C" name="Confidentiality" fill="#38bdf8" />
            <Bar dataKey="I" name="Integrity" fill="#a78bfa" />
            <Bar dataKey="A" name="Availability" fill="#facc15" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Mean authentication & authorization latency (ms)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={latencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Legend />
            <Line type="monotone" dataKey="auth" stroke="#60a5fa" name="Auth" />
            <Line type="monotone" dataKey="authz" stroke="#34d399" name="Authz" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Allowed vs denied requests">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={allowDeny}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Legend />
            <Bar dataKey="Allowed" stackId="a" fill="#22c55e" />
            <Bar dataKey="Denied" stackId="a" fill="#64748b" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Zero Trust risk score distribution">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={riskBuckets}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="bucket" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Bar dataKey="count" fill="#14b8a6" name="Requests" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Security alerts raised">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={alerts}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="model" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #475569" }} />
            <Bar dataKey="alerts" fill="#f472b6" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <MetricsTable rbac={rbac} zt={zt} />
    </div>
  );
}

function MetricsTable({
  rbac,
  zt,
}: {
  rbac: AggregatedMetrics;
  zt: AggregatedMetrics;
}) {
  const rows: [string, string, string][] = [
    ["Attack attempts", String(rbac.attackAttempts), String(zt.attackAttempts)],
    [
      "Successful unauthorized access",
      String(rbac.successfulUnauthorizedAccess),
      String(zt.successfulUnauthorizedAccess),
    ],
    [
      "False positives",
      String(rbac.falsePositives),
      String(zt.falsePositives),
    ],
    [
      "False negatives",
      String(rbac.falseNegatives),
      String(zt.falseNegatives),
    ],
    [
      "Compromised sessions",
      String(rbac.compromisedSessions),
      String(zt.compromisedSessions),
    ],
    [
      "Auth latency mean (ms)",
      rbac.authLatencyMean.toFixed(1),
      zt.authLatencyMean.toFixed(1),
    ],
    [
      "Auth latency median (ms)",
      rbac.authLatencyMedian.toFixed(1),
      zt.authLatencyMedian.toFixed(1),
    ],
    [
      "Authz std dev (ms)",
      rbac.authzLatencyStdDev.toFixed(1),
      zt.authzLatencyStdDev.toFixed(1),
    ],
  ];

  return (
    <ChartCard title="Detailed metrics (engine output)">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="text-slate-400 border-b border-slate-700">
            <th className="py-2">Metric</th>
            <th>RBAC</th>
            <th>Zero Trust</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([m, a, b]) => (
            <tr key={m} className="border-b border-slate-800 text-slate-300">
              <td className="py-1.5">{m}</td>
              <td>{a}</td>
              <td>{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ChartCard>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/40 p-3">
      <h3 className="text-sm font-medium text-slate-200 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function bucketRisk(scores: number[]) {
  const buckets = [
    { bucket: "0–20", min: 0, max: 20, count: 0 },
    { bucket: "21–40", min: 21, max: 40, count: 0 },
    { bucket: "41–60", min: 41, max: 60, count: 0 },
    { bucket: "61–80", min: 61, max: 80, count: 0 },
    { bucket: "81–100", min: 81, max: 100, count: 0 },
  ];
  for (const s of scores) {
    const b = buckets.find((x) => s >= x.min && s <= x.max) ?? buckets[4];
    b.count += 1;
  }
  return buckets;
}
