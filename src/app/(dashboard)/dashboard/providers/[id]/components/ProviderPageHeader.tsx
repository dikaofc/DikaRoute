"use client";

// Phase 1t.1 extraction — Issue #3501
import Link from "next/link";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { getHeaderIconProviderId, providerText } from "../providerPageHelpers";
import type { ProviderMessageTranslator } from "../providerPageHelpers";
import type { ProviderNotice } from "@/lib/providers/catalog";

interface ProviderInfo {
  id: string;
  name: string;
  website?: string;
  color: string;
  apiType?: string;
  /** Optional operator-supplied remote icon URL (#2166) for compatible provider nodes. */
  iconUrl?: string;
  /** Short text-badge fallback (e.g. "OC"/"AC"/"CC") shown if `iconUrl` fails to load. */
  textIcon?: string;
  /** Optional registration/API-key URL hints rendered as links (#9270). */
  notice?: ProviderNotice;
}

interface ProviderPageHeaderProps {
  providerId: string;
  providerInfo: ProviderInfo;
  connectionsCount: number;
  isOpenAICompatible: boolean;
  isAnthropicProtocolCompatible: boolean;
  onOpenTutorial: () => void;
  t: ProviderMessageTranslator;
}

export default function ProviderPageHeader({
  providerId,
  providerInfo,
  connectionsCount,
  isOpenAICompatible,
  isAnthropicProtocolCompatible,
  onOpenTutorial,
  t,
}: ProviderPageHeaderProps) {
  // Resolve the API-key registration link: prefer apiKeyUrl, fall back to
  // signupUrl, hide when neither is set (#9270).
  const noticeUrl = providerInfo.notice?.apiKeyUrl || providerInfo.notice?.signupUrl;
  const apiKeyLink = noticeUrl ? (
    <a
      href={noticeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-medium underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity inline-flex items-center gap-1"
      style={{ color: providerInfo.color }}
    >
      <span className="material-symbols-outlined text-base">open_in_new</span>
      {t("getApiKey")}
    </a>
  ) : null;

  return (
    <div className="dkr-rise">
      <Link
        href="/dashboard/providers"
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-glass-border bg-glass-bg/60 px-2.5 py-1 text-sm text-text-muted backdrop-blur-md transition-colors hover:border-primary/40 hover:text-primary"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        {t("backToProviders")}
      </Link>
      <div className="flex items-center gap-4">
        <div
          className="flex items-center justify-center rounded-2xl border border-glass-border bg-glass-bg/60 p-2.5 shadow-[var(--glass-highlight)] backdrop-blur-md"
          style={{ backgroundColor: `${providerInfo.color}12` }}
        >
          <ProviderIcon
            providerId={getHeaderIconProviderId(
              isOpenAICompatible,
              isAnthropicProtocolCompatible,
              providerInfo.id,
              providerInfo.apiType
            )}
            size={48}
            type="color"
            src={providerInfo.iconUrl}
            alt={providerInfo.name}
            fallbackText={providerInfo.textIcon}
            fallbackColor={providerInfo.color}
          />
        </div>
        <div className="min-w-0">
          {providerInfo.website ? (
            <a
              href={providerInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-3xl font-semibold tracking-tight hover:underline"
              style={{ color: providerInfo.color }}
            >
              {providerInfo.name}
              <span className="material-symbols-outlined text-lg opacity-60">open_in_new</span>
            </a>
          ) : (
            <h1 className="text-3xl font-semibold tracking-tight">{providerInfo.name}</h1>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg/60 px-2.5 py-0.5 text-xs text-text-muted backdrop-blur-md">
              <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                link
              </span>
              {t("connectionCountLabel", { count: connectionsCount })}
            </span>
            {apiKeyLink}
            {providerId === "adapta-web" && (
              <button
                onClick={onOpenTutorial}
                className="text-sm font-medium underline underline-offset-2 opacity-70 transition-opacity hover:opacity-100"
                style={{ color: providerInfo.color }}
              >
                Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
