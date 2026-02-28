import Link from "next/link";
import { Ghost, House } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#080810] px-6 text-center"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-[24px] bg-[#141422] border border-white/8 flex items-center justify-center mb-6 shadow-[0_0_48px_rgba(196,35,45,0.15)]">
        <Ghost size={36} weight="duotone" className="text-[#C4232D]" />
      </div>

      {/* Code badge */}
      <span className="inline-block px-3 py-1 rounded-full bg-[#C4232D]/10 border border-[#C4232D]/20 font-mono text-[11px] text-[#C4232D] tracking-widest uppercase mb-4">
        Error 404
      </span>

      {/* Heading */}
      <h1
        className="text-[32px] sm:text-[40px] font-bold text-white leading-tight mb-3"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Page not found
      </h1>

      <p className="text-[14px] text-white/40 max-w-[340px] leading-relaxed mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Double-check
        the URL or head back to the dashboard.
      </p>

      {/* CTA */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4232D] hover:bg-[#a81c25] text-white text-[13px] font-semibold transition-colors"
      >
        <House size={15} weight="bold" />
        Back to Dashboard
      </Link>

      {/* Subtle decoration */}
      <p className="mt-10 font-mono text-[10px] text-white/15 tracking-widest">
        TITAN JOURNAL CRM
      </p>
    </div>
  );
}
