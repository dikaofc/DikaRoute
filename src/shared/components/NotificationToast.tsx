"use client";

/**
 * NotificationToast — FASE-07 UX & Microinteractions
 *
 * Global toast notification component. Renders notifications from the
 * notificationStore as stacked toasts in the top-right corner.
 *
 * Usage: Add <NotificationToast /> to your root layout.
 */

import { useNotificationStore } from "@/store/notificationStore";
import { useState } from "react";
import { useTranslations } from "next-intl";

const ICONS = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
};

/**
 * Coerce a toast title/message to a string. `message`/`title` are typed as
 * `string`, but callers occasionally pass a raw API error body (an object) —
 * rendering that object directly throws React #31 ("Objects are not valid as a
 * React child") and freezes the whole page. This keeps the toast resilient no
 * matter what a caller hands it.
 */
export function toToastText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  if (typeof value === "object") {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string") return message;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

const COLORS = {
  success: {
    border: "rgba(48, 209, 88, 0.45)",
    icon: "#30D158",
  },
  error: {
    border: "rgba(255, 69, 58, 0.5)",
    icon: "#ff453a",
  },
  warning: {
    border: "rgba(255, 214, 10, 0.45)",
    icon: "#ffd60a",
  },
  info: {
    border: "rgba(10, 132, 255, 0.5)",
    icon: "#0a84ff",
  },
};

function Toast({ notification, onDismiss }) {
  const t = useTranslations("common");
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 200);
  };

  const color = COLORS[notification.type] || COLORS.info;

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={notification.onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "14px 16px",
        borderRadius: "16px",
        backgroundColor: "var(--glass-bg-strong)",
        border: `1px solid ${color.border}`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "var(--glass-highlight), 0 12px 40px rgba(0,0,0,0.35)",
        minWidth: "320px",
        maxWidth: "420px",
        cursor: notification.onClick ? "pointer" : "default",
        animation: isExiting ? "toastOut 0.2s ease-in forwards" : "toastIn 0.3s ease-out forwards",
        transition: "all 0.2s ease",
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: "20px",
          color: color.icon,
          lineHeight: 1,
          marginTop: "1px",
        }}
      >
        {ICONS[notification.type] || "info"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {notification.title && (
          <div
            style={{
              fontWeight: 600,
              fontSize: "14px",
              color: "var(--text-primary, #fff)",
              marginBottom: "2px",
            }}
          >
            {toToastText(notification.title)}
          </div>
        )}
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary, #ccc)",
            lineHeight: 1.4,
          }}
        >
          {toToastText(notification.message)}
        </div>
      </div>
      {notification.dismissible && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          aria-label={t("dismissNotification")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary, #999)",
            fontSize: "16px",
            padding: "0 2px",
            lineHeight: 1,
            opacity: 0.6,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.6")}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(24px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateX(0) scale(1); }
          to   { opacity: 0; transform: translateX(24px) scale(0.96); }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
        }}
      >
        {notifications.map((n) => (
          <div key={n.id} style={{ pointerEvents: "auto" }}>
            <Toast notification={n} onDismiss={removeNotification} />
          </div>
        ))}
      </div>
    </>
  );
}
