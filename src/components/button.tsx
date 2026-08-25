import { type ComponentProps } from "react";
import { clsx } from "@/lib/clsx";

const VARIANT_CLASSES = {
  primary: "bg-emerald-700 text-white hover:bg-emerald-800",
  neutral: "border border-black/15 text-black hover:bg-black/[.03]",
  danger: "border border-red-200 text-red-700 hover:bg-red-50",
  ghost: "text-black/60 hover:text-black",
} as const;

export function Button({
  variant = "neutral",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof VARIANT_CLASSES }) {
  return (
    <button
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
