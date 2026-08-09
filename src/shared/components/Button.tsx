"use client";

import { cn } from "@/shared/utils/cn";

const variants = {
  primary:
    "bg-[image:var(--grad-brand)] text-white border border-white/10 shadow-[0_8px_24px_-8px_rgba(10,132,255,0.55)] hover:brightness-110 hover:shadow-[0_12px_32px_-8px_rgba(10,132,255,0.7)]",
  accent: "bg-accent text-white border border-white/10 shadow-sm hover:bg-accent-hover",
  secondary: "glass text-text-main hover:bg-glass-bg-hover hover:border-glass-border-strong",
  outline:
    "border border-glass-border text-text-main backdrop-blur-sm hover:bg-glass-bg hover:border-glass-border-strong",
  ghost: "text-text-muted hover:bg-glass-bg hover:text-text-main",
  warning:
    "bg-amber-500 text-white border border-amber-400/30 shadow-[0_8px_24px_-10px_rgba(245,158,11,0.55)] hover:bg-amber-600",
  danger:
    "bg-red-500 text-white border border-red-400/30 shadow-[0_8px_24px_-10px_rgba(239,68,68,0.55)] hover:bg-red-600",
};

export type ButtonVariant = keyof typeof variants;

const sizes = {
  sm: "h-8 px-3.5 text-xs rounded-control",
  md: "h-10 px-5 text-sm rounded-control",
  lg: "h-12 px-7 text-sm rounded-control",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
  icon?: string;
  iconRight?: string;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex min-w-0 items-center justify-center gap-2 text-center font-medium",
        "transition-all duration-200 ease-out cursor-pointer touch-manipulation select-none",
        // GPU-accelerated feedback: hover lift + tactile press scale
        "will-change-transform hover:-translate-y-px active:translate-y-0 active:scale-[0.97]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          className="material-symbols-outlined animate-spin text-[18px] pointer-events-none shrink-0"
          aria-hidden="true"
        >
          progress_activity
        </span>
      ) : icon ? (
        <span
          className="material-symbols-outlined text-[18px] pointer-events-none shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span
          className="material-symbols-outlined text-[18px] pointer-events-none shrink-0"
          aria-hidden="true"
        >
          {iconRight}
        </span>
      )}
    </button>
  );
}
