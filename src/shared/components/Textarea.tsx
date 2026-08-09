"use client";

import { cn } from "@/shared/utils/cn";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/**
 * Textarea — token-driven multiline input mirroring the Input primitive (same glass
 * surface, focus ring and control radius). Replaces ad-hoc raw `<textarea>` styling.
 */
export default function Textarea({ className, error = false, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full py-2.5 px-3.5 text-sm text-text-main",
        "bg-glass-bg border border-glass-border rounded-control backdrop-blur-sm",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.18)]",
        "placeholder:text-text-muted/50",
        "transition-all duration-200",
        "hover:border-glass-border-strong",
        "focus:ring-2 focus:ring-accent/25 focus:border-accent/60 focus:bg-glass-bg-hover focus:outline-none",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-[16px] sm:text-sm",
        error ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/20" : "",
        className
      )}
      {...props}
    />
  );
}
