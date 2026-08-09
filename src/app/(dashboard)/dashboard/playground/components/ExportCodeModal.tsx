"use client";

// src/app/(dashboard)/dashboard/playground/components/ExportCodeModal.tsx

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { SegmentedControl } from "@/shared/components";
import type { PlaygroundState, ExportLanguage } from "@/lib/playground/codeExport";
import { exportAllLanguages, API_KEY_PLACEHOLDER } from "@/lib/playground/codeExport";

interface ExportCodeModalProps {
  state: PlaygroundState;
  onClose: () => void;
}

const LANGUAGE_TABS: Array<{ id: ExportLanguage; label: string }> = [
  { id: "curl", label: "curl" },
  { id: "python", label: "Python" },
  { id: "typescript", label: "TypeScript" },
];

/**
 * ExportCodeModal — shows curl / Python / TypeScript snippets for the current playground state.
 *
 * Security: always uses API_KEY_PLACEHOLDER ("$DIKAROUTE_API_KEY") — never a real key (D11 / Hard Rule #1).
 */
export default function ExportCodeModal({ state, onClose }: ExportCodeModalProps) {
  const t = useTranslations("playground");
  const [activeLanguage, setActiveLanguage] = useState<ExportLanguage>("curl");
  const [copied, setCopied] = useState(false);

  // Generate all snippets once (state is passed in from parent, not re-fetched).
  const snippets = exportAllLanguages(state);
  const currentCode = snippets[activeLanguage];

  // Verify that no real API key is embedded (assertion — Hard Rule #1 / D11).
  // The regex checks for typical API key patterns (sk-, or other 16+ char alphanumeric strings
  // that are NOT the placeholder).
  const hasRealKey = /sk-[A-Za-z0-9_-]{16,}/.test(currentCode);

  const handleCopy = useCallback(async () => {
    if (hasRealKey) return; // Never copy if somehow a real key slipped through
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently
    }
  }, [currentCode, hasRealKey]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md dkr-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t("exportCode")}
    >
      <div
        className="glass-strong dkr-scale-in flex max-h-[80vh] w-[640px] max-w-[96vw] flex-col rounded-[20px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex shrink-0 items-center justify-between border-b border-glass-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-text-muted">&lt;/&gt;</span>
            <h2 className="text-sm font-semibold text-text-main">{t("exportCodeTitle")}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-text-muted transition-colors hover:bg-glass-bg-hover hover:text-text-main"
            aria-label={t("closeExportModal")}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Language tabs */}
        <div className="shrink-0 px-4 pt-3">
          <SegmentedControl
            aria-label={t("exportCode")}
            size="sm"
            value={activeLanguage}
            onChange={(next) => {
              setActiveLanguage(next as ExportLanguage);
              setCopied(false);
            }}
            options={LANGUAGE_TABS.map((lang) => ({ value: lang.id, label: lang.label }))}
          />
        </div>

        {/* Code block */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
          {hasRealKey ? (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {t("exportRealKeyWarning")}
            </div>
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-glass-border bg-glass-bg/60 p-4 font-mono text-xs text-text-main backdrop-blur-xl">
              <code>{currentCode}</code>
            </pre>
          )}

          {/* Placeholder hint */}
          <p className="mt-2 text-[11px] text-text-muted">
            {t("placeholderHintPrefix")}{" "}
            <code className="font-mono text-primary">{API_KEY_PLACEHOLDER}</code>{" "}
            {t("placeholderHintSuffix")}
          </p>
        </div>

        {/* Footer with copy button */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-glass-border px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-glass-border px-3 py-1.5 text-xs text-text-muted transition-colors hover:bg-glass-bg-hover hover:text-text-main"
          >
            {t("close")}
          </button>
          <button
            onClick={handleCopy}
            disabled={hasRealKey}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              copied
                ? "border-green-500 bg-green-500/10 text-green-500"
                : "border-primary text-primary hover:bg-primary/10"
            } disabled:cursor-not-allowed disabled:opacity-40`}
            aria-label={t("copyLangCode", { language: activeLanguage })}
          >
            <span className="material-symbols-outlined text-[14px]">
              {copied ? "check" : "content_copy"}
            </span>
            {copied ? t("copiedCode") : t("copy")}
          </button>
        </div>
      </div>
    </div>
  );
}
