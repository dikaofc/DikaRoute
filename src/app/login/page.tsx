"use client";

import { useTranslations } from "next-intl";

import { useState, useEffect } from "react";
import { Button, Input } from "@/shared/components";
import { useRouter } from "next/navigation";

function AmbientOrbs() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="dkr-orb dkr-orb-1" />
      <div className="dkr-orb dkr-orb-2" />
      <div className="dkr-orb dkr-orb-3" />
    </div>
  );
}

function GlassPanel({ children, className = "" }) {
  return <div className={`glass-strong rounded-[32px] p-8 sm:p-10 ${className}`}>{children}</div>;
}

function BrandMark({ icon = "hub", tone = "from-primary to-primary-hover" }) {
  return (
    <div
      className={`flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br ${tone} shadow-[0_8px_28px_-6px_rgba(10,132,255,0.55)] ring-1 ring-white/15`}
    >
      <span className="material-symbols-outlined text-white text-[28px]">{icon}</span>
    </div>
  );
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(null);
  const [setupComplete, setSetupComplete] = useState(null);
  const [oidcEnabled, setOidcEnabled] = useState<boolean | null>(null);
  const [mounted, setMounted] = useState(false);
  const [nodeVersion, setNodeVersion] = useState(null);
  const [nodeCompatible, setNodeCompatible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    async function checkAuth() {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

      try {
        const res = await fetch(`${baseUrl}/api/settings/require-login`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.nodeVersion) setNodeVersion(data.nodeVersion);
          if (data.nodeCompatible === false) setNodeCompatible(false);
          if (data.authenticated === true || data.requireLogin === false) {
            router.push("/dashboard");
            router.refresh();
            return;
          }
          setHasPassword(!!data.hasPassword);
          setSetupComplete(!!data.setupComplete);
          setOidcEnabled(!!data.oidcEnabled);
        } else {
          setHasPassword(true);
          setSetupComplete(true);
          setOidcEnabled(false);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setHasPassword(true);
        setSetupComplete(true);
        setOidcEnabled(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("dikaroute_login_time", String(Date.now()));
        router.push("/dashboard");
        router.refresh();
      } else {
        const data = await res.json();
        // (#521) If no password is set, redirect to onboarding instead of showing an error
        if (data.needsSetup) {
          router.push("/dashboard/onboarding");
          return;
        }
        setError(data.error || t("invalidPassword"));
      }
    } catch (err) {
      setError(t("errorOccurredRetry"));
    } finally {
      setLoading(false);
    }
  };

  const nodeWarningBanner =
    !nodeCompatible && nodeVersion ? (
      <div className="w-full max-w-lg mx-auto mb-6 dkr-rise">
        <div className="glass-strong rounded-3xl p-6 border-red-500/40 shadow-[0_16px_40px_-16px_rgba(239,68,68,0.5)]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-red-400 text-[28px]">error</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-red-300 mb-1">
                {t("nodeIncompatibleTitle")}
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed mb-3">
                {t("nodeIncompatibleDesc", { version: nodeVersion })}
              </p>
              <div className="bg-black/40 rounded-xl px-4 py-3 font-mono text-sm border border-red-500/20">
                <div className="flex items-center gap-2 text-red-300/60 mb-1">
                  <span className="material-symbols-outlined text-[14px]">terminal</span>
                  <span className="text-xs">{t("nodeIncompatibleFixLabel")}</span>
                </div>
                <code className="text-amber-300">nvm install 22 && nvm use 22</code>
              </div>
              <p className="text-xs text-red-300/50 mt-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">info</span>
                {t("nodeIncompatibleHint")}
              </p>
            </div>
          </div>
        </div>
      </div>
    ) : null;

  const entrance = mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";

  if (hasPassword === null || setupComplete === null || oidcEnabled === null) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <AmbientOrbs />
        {nodeWarningBanner}
        <div className="flex flex-col items-center gap-4">
          <BrandMark icon="rocket_launch" />
          <span className="text-sm text-text-muted">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (!hasPassword && !setupComplete) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <AmbientOrbs />
        {nodeWarningBanner}
        <div className={`w-full max-w-md transition-all duration-700 ease-out ${entrance}`}>
          <div className="text-center mb-8">
            <div className="inline-flex mb-5">
              <BrandMark icon="rocket_launch" />
            </div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">{t("welcome")}</h1>
            <p className="text-text-muted mt-2">{t("configureInstance")}</p>
          </div>

          <GlassPanel>
            <div className="text-center">
              <p className="text-text-muted leading-relaxed mb-6">{t("runOnboardingWizard")}</p>
              <Button
                variant="primary"
                size="lg"
                className="w-full font-medium"
                onClick={() => router.push("/dashboard/onboarding")}
              >
                {t("startOnboarding")}
              </Button>
            </div>
          </GlassPanel>

          <p className="text-center text-xs text-text-muted/60 mt-8">
            DikaRoute — {t("unifiedProxy")}
          </p>
        </div>
      </div>
    );
  }

  if (!hasPassword && setupComplete) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <AmbientOrbs />
        {nodeWarningBanner}
        <div className={`w-full max-w-md transition-all duration-700 ease-out ${entrance}`}>
          <div className="text-center mb-8">
            <div className="inline-flex mb-5">
              <BrandMark icon="shield_person" tone="from-amber-500 to-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-text-main tracking-tight">
              {t("secureYourInstance")}
            </h1>
            <p className="text-text-muted mt-2">{t("passwordNotEnabled")}</p>
          </div>

          <GlassPanel>
            <div className="text-center">
              <p className="text-text-muted leading-relaxed mb-6">{t("setPasswordDescription")}</p>
              <Button
                variant="primary"
                size="lg"
                className="w-full font-medium"
                onClick={() => router.push("/dashboard/onboarding")}
              >
                {t("configurePassword")}
              </Button>
            </div>
          </GlassPanel>

          <p className="text-center text-xs text-text-muted/60 mt-8">
            DikaRoute — {t("unifiedAiApiProxy")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <AmbientOrbs />
      {nodeWarningBanner && (
        <div className="relative flex justify-center pt-6 px-6">{nodeWarningBanner}</div>
      )}
      <div className="relative flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className={`w-full max-w-sm transition-all duration-700 ease-out ${entrance}`}>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center justify-center size-11 rounded-2xl bg-gradient-to-br from-primary to-primary-hover shadow-[0_8px_24px_-6px_rgba(10,132,255,0.55)] ring-1 ring-white/15">
                  <span className="material-symbols-outlined text-white text-[22px]">hub</span>
                </div>
                <span className="text-xl font-semibold text-text-main tracking-tight">
                  DikaRoute
                </span>
              </div>
              <h1 className="text-2xl font-bold text-text-main tracking-tight">{t("signIn")}</h1>
              <p className="text-text-muted mt-1.5">{t("enterPassword")}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-main">{t("password")}</label>
                <Input
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  className="h-11"
                />
                {error && (
                  <p className="text-sm text-red-500 flex items-center gap-1.5 pt-1 dkr-fade-in">
                    <span className="material-symbols-outlined text-base">error</span>
                    {error}
                  </p>
                )}
                <p className="text-xs text-text-muted/60 pt-0.5">{t("defaultPasswordHint")}</p>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-medium"
                loading={loading}
              >
                {t("continue")}
              </Button>
            </form>
            {oidcEnabled && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="w-full font-medium"
                  onClick={() => (window.location.href = "/api/auth/oidc/login")}
                >
                  {t("continueWithOidc") || "Continue with OIDC"}
                </Button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-glass-border">
              <a
                href="/forgot-password"
                className="text-sm text-text-muted hover:text-primary transition-colors"
              >
                {t("forgotPassword")}
              </a>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <div
            className={`w-full max-w-md transition-all duration-700 delay-200 ease-out ${entrance}`}
          >
            <GlassPanel className="p-8">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-text-main mb-3">
                    {t("unifiedAiApiProxy")}
                  </h2>
                  <p className="text-text-muted leading-relaxed">{t("unifiedAiApiProxyDesc")}</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      icon: "swap_horiz",
                      title: t("featureMultiProviderTitle"),
                      desc: t("featureMultiProviderDesc"),
                    },
                    {
                      icon: "speed",
                      title: t("featureLoadBalancingTitle"),
                      desc: t("featureLoadBalancingDesc"),
                    },
                    {
                      icon: "analytics",
                      title: t("featureUsageTrackingTitle"),
                      desc: t("featureUsageTrackingDesc"),
                    },
                  ].map((item, idx) => (
                    <div
                      key={item.icon}
                      className="dkr-rise flex items-start gap-4 p-4 rounded-2xl glass hover:bg-glass-bg-hover transition-colors"
                      style={{ animationDelay: `${150 + idx * 90}ms` }}
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]">
                          {item.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-text-main">{item.title}</h3>
                        <p className="text-sm text-text-muted">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </div>
  );
}
