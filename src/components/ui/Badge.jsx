import { cn } from "../../lib/cn";

const VARIANTS = {
  green: "bg-[#405C36]/10 text-[#223D19] border border-[#405C36]/20",
  wine: "bg-[#8B2C4C]/10 text-[#8B2C4C] border border-[#8B2C4C]/20",
  dark: "bg-[#223D19] text-white",
  light: "bg-white text-[#070B06] border border-[#070B06]/10",
  outline: "bg-transparent text-[#070B06]/70 border border-[#070B06]/20",
  sale: "bg-[#8B2C4C] text-white",
};

export function Badge({ variant = "green", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
