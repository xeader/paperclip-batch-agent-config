import type { AgentInfo } from "./types";
import { ArrowUpDown, Bot } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type SortField = "name" | "role" | "status" | "adapterType";
type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface AgentSelectorProps {
  agents: AgentInfo[];
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  companyId: string;
}

const ROLE_COLORS: Record<string, string> = {
  ceo: "#f59e0b",
  general: "#3b82f6",
  worker: "#10b981",
  reviewer: "#8b5cf6",
};

const STATUS_COLORS: Record<string, string> = {
  idle: "#22c55e",
  paused: "#f59e0b",
  terminated: "#ef4444",
  pending_approval: "#a855f7",
  running: "#3b82f6",
};

const SORT_FIELD_LABELS: Record<SortField, string> = {
  name: "Name",
  role: "Role",
  status: "Status",
  adapterType: "Adapter",
};

const iconCache = new Map<string, React.ComponentType<{ className?: string }> | null>();

async function loadIcon(iconName: string): Promise<React.ComponentType<{ className?: string }> | null> {
  const normalized = iconName.toLowerCase().replace(/_/g, "-").replace(/^lucide-/, "");

  if (iconCache.has(normalized)) return iconCache.get(normalized) ?? null;

  try {
    const mod = await import("lucide-react") as Record<string, unknown>;
    const pascalName = normalized.split("-").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("");
    const Component = mod[pascalName] as React.ComponentType<{ className?: string }> | undefined;
    iconCache.set(normalized, Component ?? null);
    return Component ?? null;
  } catch {
    iconCache.set(normalized, null);
    return null;
  }
}

function AgentIcon({ iconName }: { iconName: string | null | undefined }) {
  const [Icon, setIcon] = useState<React.ComponentType<{ className?: string }> | null>(null);

  useEffect(() => {
    if (!iconName) { setIcon(null); return; }
    loadIcon(iconName).then(setIcon);
  }, [iconName]);

  const Cmp = Icon ?? Bot;
  return <Cmp className="h-4 w-4" />;
}

export function AgentSelector({ agents, selectedIds, onSelectionChange, companyId }: AgentSelectorProps) {
  const storageKey = `batch-agent-sort-${companyId}`;

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { sortConfig?: SortConfig };
        if (parsed.sortConfig) return parsed.sortConfig;
      }
    } catch {}
    return { field: "name", direction: "asc" };
  });

  const persistSort = useCallback((config: SortConfig) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ sortConfig: config }));
    } catch {}
  }, [storageKey]);

  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => {
      const direction: SortDirection = prev.field === field && prev.direction === "asc" ? "desc" : "asc";
      const next: SortConfig = { field, direction };
      persistSort(next);
      return next;
    });
  }, [persistSort]);

  const sortedAgents = [...agents].sort((a, b) => {
    const aVal = a[sortConfig.field] ?? "";
    const bVal = b[sortConfig.field] ?? "";
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortConfig.direction === "asc" ? cmp : -cmp;
  });

  function toggle(id: string) {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
  }

  return (
    <div>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #333" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", margin: "0 0 8px 0" }}>
          Select Agents ({selectedIds.size}/{agents.length})
        </h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => onSelectionChange(new Set(agents.map(a => a.id)))} style={btnStyle}>
            Select All
          </button>
          <button type="button" onClick={() => onSelectionChange(new Set())} style={btnStyle}>
            Clear
          </button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", paddingBottom: 4 }}>
          {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map(field => (
            <button
              key={field}
              type="button"
              onClick={() => handleSort(field)}
              style={{
                ...sortBtnStyle,
                color: sortConfig.field === field ? "#3b82f6" : "#666",
                fontWeight: sortConfig.field === field ? 600 : 400,
              }}
            >
              {SORT_FIELD_LABELS[field]}
              {sortConfig.field === field && (
                <ArrowUpDown
                  className="h-3 w-3"
                  style={{ transform: sortConfig.direction === "desc" ? "rotate(180deg)" : "none" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        {agents.length === 0 && (
          <div style={{ padding: 24, color: "#555", textAlign: "center", fontSize: 13 }}>
            No agents found
          </div>
        )}
        {sortedAgents.map(agent => {
          const selected = selectedIds.has(agent.id);
          return (
            <div
              key={agent.id}
              role="option"
              aria-selected={selected}
              tabIndex={0}
              onClick={() => toggle(agent.id)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") toggle(agent.id); }}
              style={{ ...rowStyle, background: selected ? "rgba(59,130,246,0.1)" : "transparent" }}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(agent.id)}
                style={{ cursor: "pointer" }}
              />
              <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", color: "#a1a1aa" }}>
                    <AgentIcon iconName={agent.icon} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {agent.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[agent.status] ?? "#555" }} />
                  <span style={{ fontSize: 11, color: "#888" }}>{agent.status}</span>
                  <span style={{ fontSize: 10, padding: "0 6px", borderRadius: 4, background: ROLE_COLORS[agent.role] ?? "#3f3f46", color: "#fff", lineHeight: "18px" }}>
                    {agent.role}
                  </span>
                  <span style={{ fontSize: 11, color: "#555" }}>{agent.adapterType}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "4px 12px",
  fontSize: 12,
  borderRadius: 6,
  border: "1px solid #3f3f46",
  background: "#27272a",
  color: "#d4d4d8",
  cursor: "pointer",
};

const sortBtnStyle: React.CSSProperties = {
  flex: 1,
  textAlign: "left",
  padding: "4px 8px",
  background: "transparent",
  border: "none",
  fontSize: 11,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  cursor: "pointer",
  borderBottom: "1px solid #1f1f1f",
};
