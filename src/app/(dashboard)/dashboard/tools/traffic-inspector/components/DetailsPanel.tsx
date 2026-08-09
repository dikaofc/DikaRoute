"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { InterceptedRequest } from "@/mitm/inspector/types";
import { cn } from "@/shared/utils/cn";
import { HeadersTab } from "./tabs/HeadersTab";
import { RequestBodyTab } from "./tabs/RequestBodyTab";
import { ResponseBodyTab } from "./tabs/ResponseBodyTab";
import { TimingTab } from "./tabs/TimingTab";
import { LlmDetailsTab } from "./tabs/LlmDetailsTab";
import { ConversationTab } from "./tabs/ConversationTab";
import { StatsTab } from "./tabs/StatsTab";
import { AnnotationField } from "./shared/AnnotationField";

type TabId = "conversation" | "headers" | "request" | "response" | "timing" | "llm" | "stats";

interface Tab {
  id: TabId;
  labelKey: string;
  icon: string;
  llmOnly?: boolean;
}

const TABS: Tab[] = [
  { id: "conversation", labelKey: "tabConversation", icon: "chat_bubble" },
  { id: "headers", labelKey: "tabHeaders", icon: "list" },
  { id: "request", labelKey: "tabRequest", icon: "upload" },
  { id: "response", labelKey: "tabResponse", icon: "download" },
  { id: "timing", labelKey: "tabTiming", icon: "timer" },
  { id: "llm", labelKey: "tabLlm", icon: "psychology", llmOnly: true },
  { id: "stats", labelKey: "tabStats", icon: "bar_chart" },
];

interface DetailsPanelProps {
  request: InterceptedRequest | null;
  allRequests: InterceptedRequest[];
}

export function DetailsPanel({ request, allRequests }: DetailsPanelProps) {
  const t = useTranslations("trafficInspector");
  const [activeTab, setActiveTab] = useState<TabId>("conversation");

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center text-text-muted">
        <div className="text-center space-y-2">
          <span className="material-symbols-outlined text-[36px] block" aria-hidden="true">
            info
          </span>
          <p className="text-sm">{t("selectRequest")}</p>
        </div>
      </div>
    );
  }

  const isLlm = request.detectedKind === "llm";
  const visibleTabs = TABS.filter((t) => !t.llmOnly || isLlm);

  // Ensure active tab is valid
  const currentTab = visibleTabs.find((t) => t.id === activeTab) ? activeTab : "conversation";

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label={t("requestDetails")}
        className="mx-3 mt-2 flex shrink-0 flex-wrap items-center gap-1 rounded-[14px] border border-glass-border bg-glass-bg p-1.5 backdrop-blur-md"
      >
        {visibleTabs.map((tab) => {
          const selected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1 rounded-[10px] px-2.5 text-xs transition-all duration-200 focus-ring",
                selected
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-text-muted hover:bg-glass-bg-hover hover:text-text-main"
              )}
            >
              <span className="material-symbols-outlined text-[13px]" aria-hidden="true">
                {tab.icon}
              </span>
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === "conversation" && <ConversationTab request={request} />}
        {currentTab === "headers" && <HeadersTab request={request} />}
        {currentTab === "request" && <RequestBodyTab request={request} />}
        {currentTab === "response" && <ResponseBodyTab request={request} />}
        {currentTab === "timing" && <TimingTab request={request} />}
        {currentTab === "llm" && isLlm && <LlmDetailsTab request={request} />}
        {currentTab === "stats" && <StatsTab requests={allRequests} />}
      </div>

      {/* Annotation footer */}
      <div className="shrink-0 border-t border-glass-border bg-glass-bg/40 px-3 py-2">
        <AnnotationField requestId={request.id} initialValue={request.annotation ?? ""} />
      </div>
    </div>
  );
}
