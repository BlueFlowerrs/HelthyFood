// className utility — combines class names with tailwind-merge for clean override behavior
import { twMerge } from "tailwind-merge";
import classNames from "classnames";

export function cn(...inputs) {
  return twMerge(classNames(inputs));
}

export function formatVND(value) {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "";
  return new Intl.NumberFormat("vi-VN").format(Math.round(num)) + "₫";
}
