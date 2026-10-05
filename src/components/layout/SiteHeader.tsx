import Link from "next/link";

export function SiteHeader({ variant = "light" }: { variant?: "light" | "dark" }) {
  const dark = variant === "dark";
  return (
    <header
      className={
        dark
          ? "border-b border-white/10 bg-[#0a2e4a]/95 backdrop-blur"
          : "border-b border-[#d4cfc4] bg-[#f7f5f0]/95 backdrop-blur"
      }
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              dark ? "bg-[#c45c3e] text-white" : "bg-[#0a2e4a] text-[#f7f5f0]"
            }`}
          >
            SC
          </span>
          <span
            className={`font-semibold tracking-tight ${
              dark ? "text-white" : "text-[#0a2e4a]"
            }`}
          >
            SmartCare<span className="font-normal opacity-70"> Sim</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/#how-it-works"
            className={dark ? "text-white/70 hover:text-white" : "text-[#4a5568] hover:text-[#0a2e4a]"}
          >
            How it works
          </Link>
          <Link
            href="/admin"
            className={
              dark
                ? "text-[#f0c987] hover:text-white"
                : "text-[#0a2e4a] font-medium hover:underline"
            }
          >
            Admin analysis
          </Link>
        </nav>
      </div>
    </header>
  );
}
