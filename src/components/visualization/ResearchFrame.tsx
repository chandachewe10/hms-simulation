export function ResearchFrame() {
  return (
    <section className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-5 text-sm text-slate-300 leading-relaxed">
      <h2 className="text-lg font-semibold text-teal-300 mb-2">
        Research framing
      </h2>
      <p className="mb-3">
        <strong className="text-slate-100">SmartCare-inspired simulated healthcare environment for academic research</strong>{" "}
        — roles, devices, and PHI resource classes are synthetic. This simulation
        does <em>not</em> reproduce SmartCare production architecture.
      </p>
      <p className="mb-2 text-slate-400">
        Hypothesis (under test): A context-aware Zero Trust Architecture can reduce
        unauthorized access and patient-data exposure compared with conventional
        perimeter/RBAC, while remaining feasible under Zambia-specific connectivity
        constraints. Outcomes below are{" "}
        <strong className="text-amber-200">simulation results</strong>, not field
        measurements.
      </p>
      <div className="grid md:grid-cols-3 gap-4 mt-4 text-xs">
        <div>
          <h3 className="font-medium text-slate-200 mb-1">Assumptions</h3>
          <ul className="list-disc pl-4 space-y-1" id="assumptions-list">
            <li>Parameterized users/devices and network inputs</li>
            <li>Legacy RBAC trusts hospital network boundary</li>
            <li>Attacks are scripted scenarios only</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-slate-200 mb-1">Literature (framing)</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>NIST SP 800-207 Zero Trust tenets</li>
            <li>Healthcare data classification (academic)</li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium text-slate-200 mb-1">Limitations</h3>
          <ul className="list-disc pl-4 space-y-1">
            <li>No statistical significance tests by default</li>
            <li>Requires local calibration for real facilities</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
