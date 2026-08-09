"use client";

import type { HTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";

type SpinnerSize = "sm" | "md" | "lg" | "xl";
type LoadingType = "spinner" | "page" | "skeleton" | "card";

const spinnerSizes: Record<SpinnerSize, string> = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-12",
};

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  label?: string;
}

interface PageLoadingProps {
  message?: string;
  className?: string;
}

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  type?: LoadingType;
  className?: string;
  message?: string;
  size?: SpinnerSize;
  label?: string;
}

// iOS-style ring spinner
export function Spinner({ size = "md", className, label }: SpinnerProps) {
  const t = useTranslations("common");
  const ariaLabel = label ?? t("loading");
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn("inline-flex", className)}
    >
      <span className="sr-only">{ariaLabel}</span>
      <span
        aria-hidden="true"
        className={cn(
          "block rounded-full border-2 border-text-muted/20 border-t-primary",
          "animate-spin motion-reduce:animate-none",
          spinnerSizes[size]
        )}
      />
    </span>
  );
}

// Full page loading — frosted glass backdrop
export function PageLoading({ message, className }: PageLoadingProps) {
  const t = useTranslations("common");
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/70 backdrop-blur-xl px-6 dkr-fade-in",
        className
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Spinner size="xl" />
      <p className="mt-4 text-text-muted text-center">{message ?? t("loading")}</p>
    </div>
  );
}

// Skeleton — shimmer sweep
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("skeleton motion-reduce:animate-pulse", className)}
      {...props}
    />
  );
}

// Card skeleton — glass card with shimmer blocks
export function CardSkeleton() {
  return (
    <div
      className="p-6 rounded-[var(--radius-card)] border border-glass-border bg-[image:var(--card-surface-gradient)] shadow-[var(--glass-highlight),0_10px_30px_-14px_rgba(0,0,0,0.7)]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-4 gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-10 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Default export
export default function Loading({
  type = "spinner",
  className,
  message,
  size,
  label,
  ...props
}: LoadingProps) {
  switch (type) {
    case "page":
      return <PageLoading message={message} className={className} />;
    case "skeleton":
      return <Skeleton className={className} {...props} />;
    case "card":
      return <CardSkeleton />;
    default:
      return <Spinner size={size} className={className} label={label} />;
  }
}
