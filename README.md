# Securing the Digital Pulse — Zero Trust PHI Simulation

**SmartCare-inspired simulated healthcare environment for academic research.**  
This project does **not** reproduce SmartCare production architecture.

Research project dashboard comparing **Traditional Perimeter/RBAC** and **context-aware Zero Trust** under configurable Zambia connectivity constraints (latency, packet loss, bandwidth).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Experience flow

| Route | Purpose |
|-------|---------|
| `/` | Landing — how the simulation works, pick a login path |
| `/login/traditional` | Legacy perimeter login (password only) |
| `/login/zero-trust` | MFA + context-aware gateway |
| `/portal/traditional` | Vulnerable EMR workspace + attack lab |
| `/portal/zero-trust` | Protected workspace — attacks blocked by policy engine |
| `/admin` | Analyst dashboard (batch metrics + live audit log) |

**Demo credentials**

- Traditional / Zero Trust user: `doctor` / `SmartCare2024` (Zero Trust MFA: `123456`)
- Admin analyst: `analyst` / `Analyze@2024`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development server |
| `npm run build` | Production build (Vercel-compatible) |
| `npm run test` | Vitest unit tests for the simulation engine |

## Architecture (`src/simulation/`)

| Module | Purpose |
|--------|---------|
| `users`, `devices`, `resources` | Synthetic healthcare population |
| `authentication` | Password vs MFA + session checks |
| `rbac` | Perimeter/RBAC authorization |
| `zero-trust` | Continuous verification path |
| `risk-engine`, `policy-engine` | 0–100 risk score and decisions |
| `attacks` | Six scripted attack scenarios |
| `network` | Zambia connectivity latency model |
| `metrics`, `experiments` | Reproducible trials and CSV/JSON export |

## Default experiment

- 100 users, 100 devices  
- 1,000 legitimate + 200 malicious requests per trial  
- 3 trials, seed `20261005`  

All dashboard numbers originate from `runExperiment()` — nothing is hard-coded for effect.

## Deploy on Vercel

Connect this repository to Vercel; default Next.js settings apply. No server secrets required (simulation runs in the browser).

## Research disclaimer

Outcomes are **simulation results** for hypothesis exploration. Statistical significance is **not** claimed unless you extend the engine with formal tests and calibrated field data.
