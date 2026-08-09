"use client";

import { useTranslations } from "next-intl";

/**
 * DataTable — Shared UI primitive (T-29)
 *
 * Configurable data table with sticky header, row click,
 * and optional loading/empty states. Extracts the shared
 * table rendering pattern from RequestLoggerV2 and ProxyLogger.
 *
 * iOS Fluid Glass: frosted sticky header, glass container, CSS-only
 * hover/selected rows (no per-event style mutations).
 *
 * Usage:
 *   <DataTable
 *     columns={visibleColumns}
 *     data={filteredLogs}
 *     renderCell={(row, column) => <span>{row[column.key]}</span>}
 *     onRowClick={(row) => openDetail(row)}
 *     selectedId={selectedLog?.id}
 *     loading={isLoading}
 *     emptyIcon="📋"
 *     emptyMessage="No logs found"
 *   />
 */

interface DataTableColumn {
  key: string;
  label: string;
  maxWidth?: string;
}

interface DataTableRow {
  id?: string | number;
  [key: string]: unknown;
}

interface DataTableProps {
  columns?: DataTableColumn[];
  data?: DataTableRow[];
  renderCell: (row: DataTableRow, column: DataTableColumn) => React.ReactNode;
  renderHeader?: (column: DataTableColumn) => React.ReactNode;
  onRowClick?: (row: DataTableRow) => void;
  selectedId?: string | number;
  loading?: boolean;
  maxHeight?: string;
  emptyIcon?: string;
  emptyMessage?: string;
}

export default function DataTable({
  columns = [],
  data = [],
  renderCell,
  renderHeader,
  onRowClick,
  selectedId,
  loading = false,
  maxHeight = "calc(100vh - 320px)",
  emptyIcon = "📭",
  emptyMessage,
}: DataTableProps) {
  const t = useTranslations("common");
  const resolvedEmptyMessage = emptyMessage ?? t("noData");

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-glass-border bg-glass-bg/70 px-6 py-16 backdrop-blur-xl">
        <span className="size-8 animate-spin rounded-full border-2 border-glass-border-strong border-t-primary" />
        <p className="text-sm text-text-muted">{t("loading")}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-card border border-glass-border bg-glass-bg/70 px-6 py-16 backdrop-blur-xl">
        <span className="text-4xl opacity-60">{emptyIcon}</span>
        <p className="text-sm text-text-muted">{resolvedEmptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className="overflow-auto rounded-card border border-glass-border bg-glass-bg/70 shadow-[var(--glass-highlight)] backdrop-blur-xl"
      style={{ maxHeight }}
    >
      <table className="w-full border-collapse text-xs" style={{ tableLayout: "auto" }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="sticky top-0 z-10 whitespace-nowrap border-b border-glass-border bg-[var(--table-header-bg)] px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-text-muted backdrop-blur-md"
              >
                {renderHeader ? renderHeader(col) : col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              onClick={() => onRowClick?.(row)}
              className={
                (onRowClick ? "cursor-pointer " : "") +
                (row.id === selectedId
                  ? "bg-[var(--table-row-selected)]"
                  : idx % 2 === 0
                    ? "bg-transparent hover:bg-[var(--table-row-hover)]"
                    : "bg-[var(--table-row-zebra)] hover:bg-[var(--table-row-hover)]") +
                " transition-colors duration-150"
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap border-b border-[var(--table-cell-border)] px-3 py-2"
                  style={{
                    maxWidth: col.maxWidth || "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
