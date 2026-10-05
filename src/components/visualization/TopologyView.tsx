import type { SimulationParameters } from "@/simulation/types";

export function TopologyView({ params }: { params: SimulationParameters }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
      <h2 className="text-base font-semibold text-teal-300 mb-3">
        Hospital / network topology (conceptual)
      </h2>
      <div className="grid md:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="rounded-lg border border-slate-600 p-3 bg-slate-950/50">
          <h3 className="font-medium text-slate-100 mb-2">Urban hub — Lusaka</h3>
          <p>Trusted perimeter VLAN · EMR · {Math.floor(params.userCount * 0.55)} users (sim.)</p>
          <p className="text-slate-500 mt-1">Latency baseline: {params.network.latencyMs} ms</p>
        </div>
        <div className="rounded-lg border border-slate-600 p-3 bg-slate-950/50">
          <h3 className="font-medium text-slate-100 mb-2">District sites</h3>
          <p>Clinics &amp; labs · mixed managed devices</p>
          <p className="text-slate-500 mt-1">Devices: {params.deviceCount}</p>
        </div>
        <div className="rounded-lg border border-slate-600 p-3 bg-slate-950/50">
          <h3 className="font-medium text-slate-100 mb-2">Rural outreach</h3>
          <p>Remote workers · bandwidth {params.network.bandwidthKbps} Kbps</p>
          <p className="text-slate-500 mt-1">
            Packet loss {params.network.packetLossPercent}% · concurrent{" "}
            {params.network.simultaneousUsers}
          </p>
        </div>
      </div>
      <pre className="mt-4 text-[10px] text-slate-500 overflow-x-auto leading-tight">
{`     [ Internet / Public Wi-Fi ]
              |
    +---------+---------+
    |   Perimeter FW    |  <-- Traditional implicit trust inside
    +---------+---------+
              |
    +---------+---------+
    |  Policy / PEP (ZT) |  <-- Continuous verification path
    +----+----+----+-----+
         |    |    |
    [EMR][Lab][Pharmacy records]
         PHI tiers: LOW .. CRITICAL`}
      </pre>
    </section>
  );
}
