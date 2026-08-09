"use client";

import { cn } from "@/shared/utils/cn";

interface SegmentedOption {
  value: string;
  label: string;
  icon?: string;
}

interface SegmentedControlProps {
  options?: SegmentedOption[];
  value?: string;
  onChange?: (value: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

export default function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const sizes = {
    sm: "h-7 text-xs px-3",
    md: "h-9 text-sm px-4",
    lg: "h-11 text-base px-5",
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 p-1.5 rounded-[14px]",
        "bg-glass-bg border border-glass-border backdrop-blur-md",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-[10px] font-medium transition-all duration-200 will-change-transform",
            sizes[size],
            value === option.value
              ? "bg-white/90 dark:bg-white/15 text-text-main dkr-active-pill"
              : "text-text-muted hover:text-text-main hover:bg-glass-bg-hover active:scale-[0.98]",
            option.icon && "flex items-center"
          )}
        >
          {option.icon && (
            <span className="material-symbols-outlined text-[16px] mr-1.5" aria-hidden="true">
              {option.icon}
            </span>
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}
