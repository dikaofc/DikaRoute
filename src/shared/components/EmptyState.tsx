"use client";

import { useTranslations } from "next-intl";

/**
 * EmptyState — FASE-07 UX
 *
 * Reusable empty state component for dashboard sections when no data
 * is available. Provides visual feedback and optional action button.
 */

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: (() => void) | null;
}

export default function EmptyState({
  icon = "inbox",
  title,
  description = "",
  actionLabel = "",
  onAction = null,
}: EmptyStateProps) {
  const t = useTranslations("common");
  const resolvedTitle = title ?? t("nothingHere");
  const usesMaterialSymbol = /^[a-z][a-z0-9_]*$/.test(icon);
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center min-h-[200px] gap-5">
      <div
        className="dkr-float flex items-center justify-center size-16 rounded-2xl glass text-text-muted"
        role="img"
        aria-hidden="true"
      >
        {usesMaterialSymbol ? (
          <span className="material-symbols-outlined text-[32px]">{icon}</span>
        ) : (
          <span className="text-[32px] leading-none">{icon}</span>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-text-main">{resolvedTitle}</h3>
        {description && (
          <p className="text-sm text-text-muted max-w-[320px] leading-relaxed mt-2">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] border border-primary/40 bg-primary/15 text-primary text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-primary/25 hover:-translate-y-px active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
