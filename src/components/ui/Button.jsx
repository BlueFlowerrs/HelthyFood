import { cn } from "../../lib/cn";

const VARIANTS = {
  primary:
    "bg-[#8B2C4C] text-white hover:bg-[#7a2542] active:bg-[#6a1f3a] border border-[#8B2C4C]",
  secondary:
    "bg-[#405C36] text-white hover:bg-[#324a2b] active:bg-[#243620] border border-[#405C36]",
  dark: "bg-[#223D19] text-white hover:bg-[#1a3014] border border-[#223D19]",
  outline:
    "bg-transparent border border-[#070B06]/20 text-[#070B06] hover:bg-[#070B06]/5",
  outlineLight:
    "bg-transparent border border-white/30 text-white hover:bg-white/10",
  ghost: "bg-transparent text-[#070B06] hover:bg-[#070B06]/5",
  wine: "bg-[#8B2C4C] text-white hover:bg-[#7a2542] border border-[#8B2C4C]",
};

const SIZES = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  xl: "h-16 px-10 text-base tracking-wide",
  icon: "h-10 w-10",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  asChild,
  ...props
}) {
  const Comp = asChild ? "span" : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B2C4C] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
