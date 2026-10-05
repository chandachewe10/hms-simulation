"use client";

import type { SimulationParameters } from "@/simulation/types";
import { DEFAULT_SIMULATION_PARAMETERS } from "@/simulation/experiments";
import { DEFAULT_ZAMBIA_NETWORK } from "@/simulation/network";

type Props = {
  params: SimulationParameters;
  onChange: (p: SimulationParameters) => void;
  onRun: () => void;
  running: boolean;
};

export function ParameterControls({ params, onChange, onRun, running }: Props) {
  const set = <K extends keyof SimulationParameters>(
    key: K,
    value: SimulationParameters[K]
  ) => onChange({ ...params, [key]: value });

  const setNet = (
    key: keyof SimulationParameters["network"],
    value: number
  ) =>
    onChange({
      ...params,
      network: { ...params.network, [key]: value },
    });

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <h2 className="text-base font-semibold text-teal-300 mb-3">
        Simulation parameters (Zambia connectivity &amp; scale)
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <Field label="Random seed">
          <input
            type="number"
            className="input"
            value={params.randomSeed}
            onChange={(e) => set("randomSeed", Number(e.target.value))}
          />
        </Field>
        <Field label="Trials">
          <input
            type="number"
            className="input"
            min={1}
            max={10}
            value={params.trials}
            onChange={(e) => set("trials", Number(e.target.value))}
          />
        </Field>
        <Field label="Users">
          <input
            type="number"
            className="input"
            value={params.userCount}
            onChange={(e) => set("userCount", Number(e.target.value))}
          />
        </Field>
        <Field label="Devices">
          <input
            type="number"
            className="input"
            value={params.deviceCount}
            onChange={(e) => set("deviceCount", Number(e.target.value))}
          />
        </Field>
        <Field label="Legitimate requests / trial">
          <input
            type="number"
            className="input"
            value={params.legitimateRequestCount}
            onChange={(e) =>
              set("legitimateRequestCount", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Malicious requests / trial">
          <input
            type="number"
            className="input"
            value={params.maliciousRequestCount}
            onChange={(e) =>
              set("maliciousRequestCount", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Latency (ms)">
          <input
            type="number"
            className="input"
            value={params.network.latencyMs}
            onChange={(e) => setNet("latencyMs", Number(e.target.value))}
          />
        </Field>
        <Field label="Packet loss (%)">
          <input
            type="number"
            className="input"
            step={0.1}
            value={params.network.packetLossPercent}
            onChange={(e) =>
              setNet("packetLossPercent", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Bandwidth (Kbps)">
          <input
            type="number"
            className="input"
            value={params.network.bandwidthKbps}
            onChange={(e) => setNet("bandwidthKbps", Number(e.target.value))}
          />
        </Field>
        <Field label="Simultaneous users">
          <input
            type="number"
            className="input"
            value={params.network.simultaneousUsers}
            onChange={(e) =>
              setNet("simultaneousUsers", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Device trust baseline (0–1)">
          <input
            type="number"
            className="input"
            step={0.01}
            min={0}
            max={1}
            value={params.deviceTrustBaseline}
            onChange={(e) =>
              set("deviceTrustBaseline", Number(e.target.value))
            }
          />
        </Field>
        <Field label="User risk baseline (0–1)">
          <input
            type="number"
            className="input"
            step={0.01}
            min={0}
            max={1}
            value={params.userRiskBaseline}
            onChange={(e) => set("userRiskBaseline", Number(e.target.value))}
          />
        </Field>
        <Field label="Auth strength / MFA (0–1)">
          <input
            type="number"
            className="input"
            step={0.01}
            min={0}
            max={1}
            value={params.authenticationStrength}
            onChange={(e) =>
              set("authenticationStrength", Number(e.target.value))
            }
          />
        </Field>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={running}
          onClick={onRun}
        >
          {running ? "Running experiment…" : "Run experiment"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            onChange({
              ...DEFAULT_SIMULATION_PARAMETERS,
              network: { ...DEFAULT_ZAMBIA_NETWORK },
            })
          }
        >
          Reset defaults
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-slate-400">
      <span>{label}</span>
      {children}
    </label>
  );
}
