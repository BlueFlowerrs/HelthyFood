import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return (
    <div className={cn("animate-pulse bg-[#070B06]/5 rounded-lg", className)} />
  );
}
