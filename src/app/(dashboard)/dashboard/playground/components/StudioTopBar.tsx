"use client";

// src/app/(dashboard)/dashboard/playground/components/StudioTopBar.tsx

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/shared/components";
import TokenCostCounter from "./TokenCostCounter";
import ExportCodeModal from "./ExportCodeModal";
import type { StreamMetrics } from "@/shared/schemas/playground";
import type { PlaygroundState } from "@/lib/playground/codeExport";

export type StudioTab = "chat" | "compare" | "api" | "build";

interface StudioTopBarProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  metrics: StreamMetrics;
  /** Optional playground state for the Export code modal. If omitted, a minimal state is used. */
  exportState?: PlaygroundState;
}

interface TabConfig {
  id: StudioTab;
  labelKey: "tabChat" | "tabCompare" | "tabApi" | "tabBuild";
  icon: string;
}

const TABS: TabConfig[] = [
  { id: "chat", labelKey: "tabChat", icon: "chat" },
  { id: "compare", labelKey: "tabCompare", icon: "compare" },
  { id: "api", labelKey: "tabApi", icon: "api" },
  { id: "build", labelKey: "tabBuild", icon: "build" },
];

/**
 * Top bar with tab switcher, token/cost counter, and export code button.
 * Export code modal uses ExportCodeModal (F7) when exportState is provided.
 */
export default function StudioTopBar({
  activeTab,
  onTabChange,
  metrics,
  exportState,
}: StudioTopBarProps) {
  const t = useTranslations("playground");
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-glass-border bg-glass-bg/50 px-4 py-2.5 backdrop-blur-md shrink-0">
        {/* Tabs */}
        <SegmentedControl
          size="sm"
          value={activeTab}
          onChange={(next) => onTabChange(next as StudioTab)}
          options={TABS.map((tab) => ({
            value: tab.id,
            label: t(tab.labelKey),
            icon: tab.icon,
          }))}
        />

        {/* Right side: token counter + export button */}
        <div className="flex items-center gap-3">
          <TokenCostCounter
            tokensIn={metrics.tokensIn}
            tokensOut={metrics.tokensOut}
            costUsd={metrics.costUsd}
          />

          <button
            onClick={() => setExportOpen(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-muted hover:text-text-main transition-colors"
            title={t("exportCode")}
            aria-label={t("exportCode")}
          >
            <span className="font-mono text-[11px]">&lt;/&gt;</span>
            <span>{t("exportShort")}</span>
          </button>
        </div>
      </div>

      {/* Export code modal — uses ExportCodeModal (F7) */}
      {exportOpen && exportState != null && (
        <ExportCodeModal state={exportState} onClose={() => setExportOpen(false)} />
      )}
      {exportOpen && exportState == null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md dkr-fade-in"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="glass-strong dkr-scale-in w-[480px] max-w-full rounded-[20px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-main">{t("exportCodeTitle")}</h2>
              <button
                onClick={() => setExportOpen(false)}
                className="text-text-muted transition-colors hover:text-text-main"
                aria-label={t("closeExportModal")}
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <p className="text-sm text-text-muted">{t("noStateToExport")}</p>
          </div>
        </div>
      )}
    </>
  );
}
