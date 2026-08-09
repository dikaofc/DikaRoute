"use client";

import SegmentedControl from "@/shared/components/SegmentedControl";
import type { UtilizationTimeRange } from "@/shared/types/utilization";

interface TimeRangeSelectorProps {
  value: UtilizationTimeRange;
  onChange: (range: UtilizationTimeRange) => void;
}

const OPTIONS: Array<{ value: UtilizationTimeRange; label: string }> = [
  { value: "1h", label: "1h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
];

export default function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <SegmentedControl
      aria-label="Select time range"
      size="sm"
      options={OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      value={value}
      onChange={(next) => onChange(next as UtilizationTimeRange)}
    />
  );
}
