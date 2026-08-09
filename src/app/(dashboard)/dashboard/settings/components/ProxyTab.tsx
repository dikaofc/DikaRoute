"use client";
import { useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import GlobalConfigTab from "./proxy/GlobalConfigTab";
import ProxyPoolTab from "./proxy/ProxyPoolTab";
import FreePoolTab from "./proxy/FreePoolTab";
import DocumentationTab from "./proxy/DocumentationTab";
import SubscriptionTab from "./proxy/SubscriptionTab";

type TabId = "global-config" | "proxy-pool" | "free-pool" | "documentation" | "subscriptions";

const TABS: Array<{ id: TabId; labelKey: string; fallback: string }> = [
  { id: "global-config", labelKey: "proxyGlobalConfigTab", fallback: "Global config" },
  { id: "proxy-pool", labelKey: "proxyPoolTab", fallback: "Proxy pool" },
  { id: "free-pool", labelKey: "freePoolTab", fallback: "Free pool" },
  { id: "documentation", labelKey: "proxyDocumentationTab", fallback: "Documentation" },
  { id: "subscriptions", labelKey: "proxySubscriptionsTab", fallback: "Subscriptions" },
];

export default function ProxyTab() {
  const t = useTranslations("settings");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const translateOrFallback = (key: string, fallback: string) =>
    typeof t.has === "function" && !t.has(key) ? fallback : t(key);

  const activeTab = useMemo<TabId>(() => {
    const tabParam = searchParams.get("tab") as TabId | null;
    return tabParam && TABS.some((tab) => tab.id === tabParam) ? tabParam : "global-config";
  }, [searchParams]);

  const handleTabChange = (tab: TabId) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] border border-glass-border bg-glass-bg p-1.5 backdrop-blur-md"
        role="tablist"
        aria-label={translateOrFallback("proxySubTabsAria", "Proxy sections")}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`whitespace-nowrap rounded-[10px] px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white/90 text-text-main shadow-sm dark:bg-white/15 dkr-active-pill"
                : "text-text-muted hover:bg-glass-bg-hover hover:text-text-main"
            }`}
          >
            {translateOrFallback(tab.labelKey, tab.fallback)}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === "global-config" && <GlobalConfigTab />}
        {activeTab === "proxy-pool" && <ProxyPoolTab />}
        {activeTab === "free-pool" && <FreePoolTab />}
        {activeTab === "documentation" && <DocumentationTab />}
        {activeTab === "subscriptions" && <SubscriptionTab />}
      </div>
    </div>
  );
}
