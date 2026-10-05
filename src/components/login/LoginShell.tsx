import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function LoginShell({
  title,
  subtitle,
  accent,
  children,
}: {
  title: string;
  subtitle: string;
  accent: "legacy" | "zt";
  children: React.ReactNode;
}) {
  const isZt = accent === "zt";
  return (
    <div
      className={`min-h-screen ${
        isZt
          ? "bg-gradient-to-br from-[#eef6f4] via-[#f7f5f0] to-[#e8eef5]"
          : "bg-gradient-to-br from-[#ebe6dc] via-[#f7f5f0] to-[#e2ddd2]"
      }`}
    >
      <SiteHeader />
      <div className="max-w-md mx-auto px-4 py-12">
        <Link href="/" className="text-sm text-[#5c6578] hover:text-[#0a2e4a]">
          ← Back to overview
        </Link>
        <div
          className={`mt-6 rounded-2xl border shadow-xl overflow-hidden ${
            isZt ? "border-[#0d7a6f]/30 bg-white" : "border-[#b8b0a0] bg-[#faf8f4]"
          }`}
        >
          <div
            className={`px-6 py-4 ${
              isZt
                ? "bg-[#0a2e4a] text-white"
                : "bg-[#6b7280] text-white"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-80">
              {isZt ? "Zero Trust gateway" : "Traditional perimeter login"}
            </p>
            <h1 className="text-xl font-semibold mt-1">{title}</h1>
            <p className="text-sm opacity-90 mt-1">{subtitle}</p>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
