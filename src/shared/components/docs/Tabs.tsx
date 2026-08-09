"use client";

import React, { useState } from "react";
import { cn } from "@/shared/utils/cn";

interface Tab {
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultIndex?: number;
  className?: string;
}

export default function Tabs({ tabs, defaultIndex = 0, className }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  return (
    <div className={cn("my-6 flex flex-col gap-3", className)}>
      <div
        role="tablist"
        className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-[14px] border border-glass-border bg-glass-bg p-1.5 backdrop-blur-md"
      >
        {tabs.map((tab, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={activeIndex === index}
            aria-controls={`tab-panel-${index}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "whitespace-nowrap rounded-[10px] px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-[0.98]",
              activeIndex === index
                ? "dkr-active-pill bg-white/90 text-text-main dark:bg-white/15"
                : "text-text-muted hover:bg-glass-bg-hover hover:text-text-main"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        id={`tab-panel-${activeIndex}`}
        role="tabpanel"
        className="rounded-[16px] border border-glass-border bg-glass-bg/60 p-5 backdrop-blur-xl"
      >
        {tabs[activeIndex].content}
      </div>
    </div>
  );
}
