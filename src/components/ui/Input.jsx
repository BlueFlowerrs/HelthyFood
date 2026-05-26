import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef(function Input(
  { className, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-12 w-full rounded-lg border border-[#070B06]/15 bg-white px-4 text-sm text-[#070B06] placeholder:text-[#070B06]/40 transition-colors focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/20 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[100px] w-full rounded-lg border border-[#070B06]/15 bg-white px-4 py-3 text-sm text-[#070B06] placeholder:text-[#070B06]/40 transition-colors focus:border-[#405C36] focus:outline-none focus:ring-2 focus:ring-[#405C36]/20",
        className,
      )}
      {...props}
    />
  );
});

export function Label({ children, htmlFor, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-xs uppercase tracking-[0.12em] font-medium text-[#070B06]/70 mb-2",
        className,
      )}
    >
      {children}
    </label>
  );
}
