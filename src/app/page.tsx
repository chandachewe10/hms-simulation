import { Dashboard } from "@/components/visualization/Dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Dashboard />
      </div>
    </main>
  );
}
