import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#1a202c]">
      <SiteHeader />
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230a2e4a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative">
          <p className="text-sm font-medium text-[#c45c3e] uppercase tracking-widest">
            Zambia healthcare · research simulation
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-serif text-[#0a2e4a] max-w-2xl leading-tight">
            Securing the Digital Pulse
          </h1>
          <p className="mt-5 text-lg text-[#4a5568] max-w-xl leading-relaxed">
            Experience two ways the same clinical staff access patient health
            information — legacy perimeter trust versus continuous Zero Trust —
            then review outcomes in the admin analysis console.
          </p>
          <p className="mt-3 text-sm text-[#6b7280] max-w-xl">
            SmartCare-<em>inspired</em> synthetic environment for academic
            research. Not a production system.
          </p>
        </div>
      </section>

      <section id="how-it-works" className="bg-white border-y border-[#d4cfc4]">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-serif text-[#0a2e4a]">How it works</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Choose an entry path",
                body: "Sign in through the traditional hospital login or the Zero Trust gateway (password + MFA).",
              },
              {
                step: "2",
                title: "Use the clinical portal",
                body: "Open simulated PHI records and run scripted attack scenarios on each path.",
              },
              {
                step: "3",
                title: "Review evidence",
                body: "The admin dashboard aggregates live audit events with batch experiment metrics.",
              },
            ].map((item) => (
              <li key={item.step} className="relative pl-12">
                <span className="absolute left-0 top-0 w-9 h-9 rounded-full bg-[#0a2e4a] text-[#f7f5f0] flex items-center justify-center font-semibold text-sm">
                  {item.step}
                </span>
                <h3 className="font-semibold text-[#0a2e4a]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#5c6578] leading-relaxed">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-serif text-[#0a2e4a] text-center">
          Select a login experience
        </h2>
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <Link
            href="/login/traditional"
            className="group rounded-2xl border-2 border-[#b8b0a0] bg-[#faf8f4] p-8 hover:border-[#6b7280] transition shadow-sm hover:shadow-md"
          >
            <span className="text-xs uppercase tracking-widest text-[#6b7280]">
              Path A
            </span>
            <h3 className="mt-2 text-xl font-semibold text-[#4b5563] group-hover:text-[#374151]">
              Traditional perimeter login
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#5c6578]">
              <li>• Username and password only</li>
              <li>• Implicit trust inside the hospital network</li>
              <li>• Simulated attacks often succeed here</li>
            </ul>
            <span className="inline-block mt-6 text-sm font-medium text-[#6b7280] group-hover:underline">
              Enter legacy portal →
            </span>
          </Link>

          <Link
            href="/login/zero-trust"
            className="group rounded-2xl border-2 border-[#0a2e4a]/20 bg-white p-8 hover:border-[#0d7a6f] transition shadow-sm hover:shadow-lg"
          >
            <span className="text-xs uppercase tracking-widest text-[#0d7a6f]">
              Path B
            </span>
            <h3 className="mt-2 text-xl font-semibold text-[#0a2e4a]">
              Zero Trust healthcare login
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-[#5c6578]">
              <li>• MFA and device context at sign-in</li>
              <li>• Continuous verification on every record access</li>
              <li>• Same attacks blocked or constrained with risk scores</li>
            </ul>
            <span className="inline-block mt-6 text-sm font-medium text-[#0d7a6f] group-hover:underline">
              Enter secure portal →
            </span>
          </Link>
        </div>

        <p className="text-center mt-10">
          <Link
            href="/admin"
            className="text-[#0a2e4a] font-medium border-b-2 border-[#c45c3e] hover:border-[#0a2e4a] pb-0.5"
          >
            Admin analysis dashboard
          </Link>
          <span className="text-[#6b7280] text-sm ml-2">
            (experiment metrics + live audit trail)
          </span>
        </p>
      </section>

      <footer className="border-t border-[#d4cfc4] py-8 text-center text-xs text-[#8a8175]">
        Research simulation · PHI is synthetic · Outcomes generated by the engine
      </footer>
    </div>
  );
}
