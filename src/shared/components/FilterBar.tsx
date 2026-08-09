"use client";

/**
 * FilterBar — Shared UI primitive (T-29)
 *
 * Reusable filter bar with search input and optional filter chips.
 * Used by RequestLoggerV2, ProxyLogger, and similar data tables.
 */

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/utils/cn";

export default function FilterBar({
  searchValue = "",
  onSearchChange,
  placeholder,
  filters = [],
  activeFilters = {},
  onFilterChange,
  children,
}) {
  const t = useTranslations("common");
  const [expandedFilter, setExpandedFilter] = useState(null);

  const handleClear = useCallback(() => {
    onSearchChange("");
    filters.forEach((f) => onFilterChange(f.key, ""));
    setExpandedFilter(null);
  }, [onSearchChange, filters, onFilterChange]);

  const hasActiveFilters = searchValue || Object.values(activeFilters).some((v) => v && v !== "");

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {/* Search input */}
      <div className="relative flex-1 basis-48 min-w-48">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted/50 pointer-events-none">
          <span className="material-symbols-outlined text-[18px]">search</span>
        </span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder || t("search")}
          className="w-full pl-9 pr-3 py-2 text-[13px] rounded-[10px] border border-glass-border bg-glass-bg text-text-main placeholder:text-text-muted/50 outline-none transition-all duration-200 focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />
      </div>

      {/* Filter chips */}
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <button
            onClick={() => setExpandedFilter(expandedFilter === filter.key ? null : filter.key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-[10px] border cursor-pointer whitespace-nowrap transition-all duration-200",
              activeFilters[filter.key]
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-glass-border bg-glass-bg text-text-muted hover:text-text-main hover:border-glass-border-strong"
            )}
          >
            {filter.label}
            {activeFilters[filter.key] ? ` · ${activeFilters[filter.key]}` : ""}
          </button>
          {expandedFilter === filter.key && (
            <div className="absolute top-full left-0 mt-1.5 glass-strong rounded-xl p-1.5 z-50 min-w-[120px]">
              <button
                onClick={() => {
                  onFilterChange(filter.key, "");
                  setExpandedFilter(null);
                }}
                className="block w-full px-3 py-1.5 text-left text-xs text-text-muted hover:bg-glass-bg hover:text-text-main rounded-lg cursor-pointer transition-colors"
              >
                {t("all")}
              </button>
              {(filter.options || []).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onFilterChange(filter.key, opt);
                    setExpandedFilter(null);
                  }}
                  className={cn(
                    "block w-full px-3 py-1.5 text-left text-xs rounded-lg cursor-pointer transition-colors",
                    activeFilters[filter.key] === opt
                      ? "bg-primary/20 text-primary"
                      : "text-text-main hover:bg-glass-bg"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Clear all */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-[10px] border border-red-500/30 bg-red-500/10 text-red-500 cursor-pointer transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50 active:scale-[0.98]"
        >
          {t("clear")}
        </button>
      )}

      {/* Extra controls (e.g. refresh button) */}
      {children}
    </div>
  );
}
