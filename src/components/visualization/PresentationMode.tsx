"use client";

import { useMemo, useState } from "react";
import { SeededRng } from "@/simulation/rng";
import { generateUsers } from "@/simulation/users";
import { generateDevices } from "@/simulation/devices";
import { generateResources } from "@/simulation/resources";
import {
  PRESENTATION_LABELS,
  presentationScenario,
} from "@/simulation/attacks";
import { authorizeRbac } from "@/simulation/rbac";
import { authorizeZeroTrust } from "@/simulation/zero-trust";
import type { PresentationScenarioId, SimulationParameters } from "@/simulation/types";
import { OutcomeCard } from "./OutcomeCard";

const SCENARIOS = Object.keys(PRESENTATION_LABELS) as PresentationScenarioId[];

type Props = { params: SimulationParameters };

export function PresentationMode({ params }: Props) {
  const [active, setActive] = useState<PresentationScenarioId>("doctor_normal");

  const comparison = useMemo(() => {
    const rng = new SeededRng(params.randomSeed);
    const users = generateUsers(
      Math.max(30, params.userCount),
      rng,
      params.authenticationStrength,
      params.userRiskBaseline
    );
    const devices = generateDevices(
      Math.max(30, params.deviceCount),
      users,
      rng,
      params.deviceTrustBaseline
    );
    const resources = generateResources(40, "ZM-PAT");
    const preset = presentationScenario(active, users, devices, resources);
    return {
      label: PRESENTATION_LABELS[active],
      traditional: authorizeRbac(
        preset.user,
        preset.device,
        preset.resource,
        preset.context,
        params.network
      ),
      zeroTrust: authorizeZeroTrust(
        preset.user,
        preset.device,
        preset.resource,
        preset.context,
        params.network
      ),
    };
  }, [active, params]);

  return (
    <section className="rounded-xl border border-violet-800/60 bg-slate-900/60 p-4">
      <h2 className="text-base font-semibold text-violet-300 mb-2">
        Presentation mode (live scenario comparison)
      </h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {SCENARIOS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={
              active === id
                ? "px-3 py-1.5 rounded-md bg-violet-600 text-white text-xs"
                : "px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            }
          >
            {PRESENTATION_LABELS[id]}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-400 mb-3">{comparison.label}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <OutcomeCard title="TRADITIONAL RBAC" outcome={comparison.traditional} />
        <OutcomeCard title="ZERO TRUST" outcome={comparison.zeroTrust} />
      </div>
    </section>
  );
}
