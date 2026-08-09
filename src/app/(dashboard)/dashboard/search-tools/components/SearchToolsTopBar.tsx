"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import ExportCodeModal from "@/app/(dashboard)/dashboard/playground/components/ExportCodeModal";
import type { PlaygroundState } from "@/lib/playground/codeExport";

export type ActiveTab = "search" | "scrape" | "compare";

interface SearchToolsTopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  latencyMs?: number | null;
  costUsd?: number | null;
  exportState?: PlaygroundState;
}

const TABS: { id: ActiveTab; icon: string; labelKey: "tabSearch" | "tabScrape" | "tabCompare" }[] =
  [
    { id: "search", icon: "🔍", labelKey: "tabSearch" },
    { id: "scrape", icon: "📄", labelKey: "tabScrape" },
    { id: "compare", icon: "⚖", labelKey: "tabCompare" },
  ];

export default function SearchToolsTopBar({
  activeTab,
  onTabChange,
  latencyMs,
  costUsd,
  exportState,
}: SearchToolsTopBarProps) {
  const t = useTranslations("search");
  const tPlayground = useTranslations("playground");
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center justify-between gap-3 border-b border-glass-border bg-glass-bg/50 px-4 py-2.5 backdrop-blur-md"
        data-testid="search-tools-topbar"
      >
        {/* Tab switcher */}
        <div
          className="inline-flex items-center gap-1 rounded-[12px] border border-glass-border bg-glass-bg/70 p-1 backdrop-blur-md"
          role="tablist"
          aria-label={t("searchTools")}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={[
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white/90 text-text-main shadow-sm dark:bg-white/15 dkr-active-pill"
                  : "text-text-muted hover:bg-glass-bg-hover hover:text-text-main",
              ].join(" ")}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              <span>{t(tab.labelKey)}</span>
            </button>
          ))}
        </div>

        {/* Metrics + export */}
        <div className="flex items-center gap-3">
          {latencyMs != null && (
            <span className="text-[11px] text-text-muted" data-testid="metric-latency">
              {latencyMs}ms
            </span>
          )}
          {costUsd != null && (
            <span className="text-[11px] text-text-muted" data-testid="metric-cost">
              ${costUsd.toFixed(4)}
            </span>
          )}
          <button
            className="flex items-center gap-1 rounded-lg border border-glass-border bg-glass-bg/70 px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-glass-border-strong hover:bg-glass-bg-hover hover:text-text-main"
            onClick={() => setExportOpen(true)}
            aria-label={tPlayground("exportCode")}
            data-testid="export-code-button"
          >
            <span className="font-mono text-[11px]">{"/>"}</span>
            <span>{tPlayground("exportShort")}</span>
          </button>
        </div>
      </div>

      {exportOpen && exportState != null && (
        <ExportCodeModal onClose={() => setExportOpen(false)} state={exportState} />
      )}
    </>
  );
}
