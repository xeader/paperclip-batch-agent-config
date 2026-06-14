import type { AgentInfo } from "./types";
import { ArrowUpDown, Bot, GripVertical, ListTree, ExternalLink, ListChecks, SquareX } from "lucide-react";
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

function hexToRgba10(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, 0.1)`;
}

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

type SortMode = "auto" | "manual" | "hierarchy";

const MODE_LABELS: Record<SortMode, string> = {
  auto: "Auto",
  manual: "Manual",
  hierarchy: "Hierarchy",
};

const MODE_NEXT: Record<SortMode, SortMode> = {
  auto: "manual",
  manual: "hierarchy",
  hierarchy: "auto",
};

function buildHierarchy(agents: AgentInfo[], siblingOrder?: Record<string, string[]>) {
  const childMap = new Map<string, string[]>();
  const agentMap = new Map(agents.map(a => [a.id, a]));
  const roots: string[] = [];

  for (const a of agents) {
    if (a.reportsTo && agentMap.has(a.reportsTo)) {
      const children = childMap.get(a.reportsTo) ?? [];
      children.push(a.id);
      childMap.set(a.reportsTo, children);
    } else {
      roots.push(a.id);
    }
  }

  const result: { agent: AgentInfo; depth: number }[] = [];

  function walk(parentId: string, ids: string[], depth: number) {
    const sk = parentId + "-" + depth;
    const ordered = siblingOrder && siblingOrder[sk] ? siblingOrder[sk].filter((id) => ids.includes(id)) : ids;
    const missing = ids.filter((id) => !ordered.includes(id));
    const final = [...ordered, ...missing];
    for (const id of final) {
      const agent = agentMap.get(id);
      if (!agent) continue;
      result.push({ agent, depth });
      const children = childMap.get(id);
      if (children) walk(id, children, depth + 1);
    }
  }

  walk("root", roots, 0);
  return result;
}

export function AgentSelector({ agents, selectedIds, onSelectionChange, companyId }: AgentSelectorProps) {
  const sortKey = `batch-agent-sort-${companyId}`;
  const orderKey = `batch-agent-order-${companyId}`;
  const hierOrderKey = `batch-hierarchy-order-${companyId}`;

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    try {
      const saved = localStorage.getItem(sortKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { sortConfig?: SortConfig };
        if (parsed.sortConfig) return parsed.sortConfig;
      }
    } catch {}
    return { field: "name", direction: "asc" };
  });

  const modeKey = `batch-agent-mode-${companyId}`;

  const [sortMode, setSortMode] = useState<SortMode>(() => {
    try { return (localStorage.getItem(modeKey) as SortMode) || "auto"; } catch { return "auto"; }
  });
  const [manualOrder, setManualOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(orderKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [hierarchyOrder, setHierarchyOrder] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem(hierOrderKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [lastClickedIdx, setLastClickedIdx] = useState<number | null>(null);

  const persistSort = useCallback((config: SortConfig) => {
    try { localStorage.setItem(sortKey, JSON.stringify({ sortConfig: config })); } catch {}
  }, [sortKey]);

  const persistOrder = useCallback((ids: string[]) => {
    try { localStorage.setItem(orderKey, JSON.stringify(ids)); } catch {}
  }, [orderKey]);

  const persistHierOrder = useCallback((order: Record<string, string[]>) => {
    try { localStorage.setItem(hierOrderKey, JSON.stringify(order)); } catch {}
  }, [hierOrderKey]);

  const handleSort = useCallback((field: SortField) => {
    setSortConfig(prev => {
      const direction: SortDirection = prev.field === field && prev.direction === "asc" ? "desc" : "asc";
      const next: SortConfig = { field, direction };
      persistSort(next);
      return next;
    });
  }, [persistSort]);

  function cycleMode() {
    setSortMode(prev => {
      const next = MODE_NEXT[prev];
      const needsInit = next === "manual" && (!manualOrder.length || manualOrder.length !== agents.length);
      if (needsInit) {
        const ids = [...agents].sort((a, b) => {
          const aVal = a[sortConfig.field] ?? "";
          const bVal = b[sortConfig.field] ?? "";
          const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return sortConfig.direction === "asc" ? cmp : -cmp;
        }).map(a => a.id);
        persistOrder(ids);
        setManualOrder(ids);
      }
      try { localStorage.setItem(modeKey, next); } catch {}
      return next;
    });
  }

  function getSortedAgents(list: AgentInfo[], config: SortConfig) {
    return [...list].sort((a, b) => {
      const aVal = a[config.field] ?? "";
      const bVal = b[config.field] ?? "";
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return config.direction === "asc" ? cmp : -cmp;
    });
  }

  const agentMap = new Map(agents.map(a => [a.id, a]));

  let hierarchyList: { agent: AgentInfo; depth: number }[] | null = null;
  let displayAgents: AgentInfo[];

  if (sortMode === "hierarchy") {
    hierarchyList = buildHierarchy(agents, hierarchyOrder);
    displayAgents = hierarchyList.map(h => h.agent);
  } else if (sortMode === "manual" && manualOrder.length > 0) {
    displayAgents = manualOrder.map(id => agentMap.get(id)).filter((a): a is AgentInfo => !!a);
    agents.forEach(a => { if (!manualOrder.includes(a.id)) displayAgents.push(a); });
  } else {
    displayAgents = getSortedAgents(agents, sortConfig);
  }

  const isManual = sortMode === "manual";
  const isHierarchy = sortMode === "hierarchy";
  const isDraggable = isManual || isHierarchy;
  const headersDisabled = isDraggable;

  function collectDescendants(id: string, base: AgentInfo[]): string[] {
    const children = base.filter(a => a.reportsTo === id);
    return [id, ...children.flatMap(c => collectDescendants(c.id, base))];
  }

  function toggle(id: string, idx: number, shiftKey: boolean, ctrlKey: boolean) {
    if (ctrlKey) {
      const ids = collectDescendants(id, agents);
      const allSelected = ids.every(i => selectedIds.has(i));
      const next = new Set(selectedIds);
      for (const i of ids) allSelected ? next.delete(i) : next.add(i);
      onSelectionChange(next);
      setLastClickedIdx(idx);
      return;
    }
    if (shiftKey && lastClickedIdx !== null && lastClickedIdx !== idx) {
      const list = hierarchyList ?? displayAgents.map(a => ({ agent: a, depth: 0 }));
      const min = Math.min(lastClickedIdx, idx);
      const max = Math.max(lastClickedIdx, idx);
      const next = new Set(selectedIds);
      for (let i = min; i <= max; i++) next.add(list[i].agent.id);
      onSelectionChange(next);
      setLastClickedIdx(idx);
      return;
    }
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectionChange(next);
    setLastClickedIdx(idx);
  }

  function getSiblingKey(data: { agent: AgentInfo; depth: number }[], idx: number) {
    if (data[idx].depth === 0) return "root-0";
    for (let j = idx - 1; j >= 0; j--) {
      if (data[j].depth === data[idx].depth - 1) return data[j].agent.id + "-" + data[idx].depth;
    }
    return "root-0";
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIdx === null || !isDraggable) return;

    if (isHierarchy && hierarchyList) {
      const blkGroup = getSiblingKey(hierarchyList, dragIdx);
      const tgtGroup = getSiblingKey(hierarchyList, idx);
      if (blkGroup !== tgtGroup || dragIdx === idx) return;

      const newOrder = { ...hierarchyOrder };
      const groupIds = hierarchyList
        .map((h, i) => (getSiblingKey(hierarchyList, i) === blkGroup ? h.agent.id : null))
        .filter((id): id is string => !!id);
      const idxInGroup = groupIds.indexOf(hierarchyList[dragIdx].agent.id);
      const tgtInGroup = groupIds.indexOf(hierarchyList[idx].agent.id);
      if (idxInGroup < 0 || tgtInGroup < 0) return;
      groupIds.splice(idxInGroup, 1);
      groupIds.splice(tgtInGroup, 0, hierarchyList[dragIdx].agent.id);
      newOrder[blkGroup] = groupIds;
      setHierarchyOrder(newOrder);
      setDragIdx(idx);
      persistHierOrder(newOrder);
    } else {
      if (dragIdx === idx) return;
      const order = [...manualOrder];
      const [moved] = order.splice(dragIdx, 1);
      const targetIdx = idx > dragIdx ? idx - 1 : idx;
      order.splice(targetIdx, 0, moved);
      setManualOrder(order);
      setDragIdx(targetIdx);
      persistOrder(order);
    }
  }

  function handleDragEnd() { setDragIdx(null); }

  return (
    <div>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #333" }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", margin: "0 0 8px 0" }}>
          Select Agents ({selectedIds.size}/{agents.length})
        </h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button type="button" onClick={() => onSelectionChange(new Set(agents.map(a => a.id)))} style={{ ...btnStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ListChecks size={14} />
            Select All
          </button>
          <button type="button" onClick={() => onSelectionChange(new Set())} style={{ ...btnStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
            <SquareX size={14} />
            Clear
          </button>
          <div style={{ flex: 1 }} />
          <button
            type="button"
            onClick={cycleMode}
            title={`Switch to ${MODE_LABELS[MODE_NEXT[sortMode]]} mode`}
            style={{
              ...btnStyle,
              display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
              background: isManual || isHierarchy ? "#3b82f6" : "#27272a",
              color: isManual || isHierarchy ? "#fff" : "#d4d4d8",
            }}
          >
            {isManual ? <GripVertical size={14} /> : isHierarchy ? <ListTree size={14} /> : <ArrowUpDown size={14} />}
            {MODE_LABELS[sortMode]}
          </button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", paddingBottom: 4 }}>
          {(Object.keys(SORT_FIELD_LABELS) as SortField[]).map(field => (
            <button
              key={field}
              type="button"
              disabled={headersDisabled}
              onClick={() => handleSort(field)}
              style={{
                ...sortBtnStyle,
                color: headersDisabled ? "#444" : sortConfig.field === field ? "#3b82f6" : "#666",
                fontWeight: headersDisabled ? 400 : sortConfig.field === field ? 600 : 400,
              }}
            >
              {SORT_FIELD_LABELS[field]}
              {!headersDisabled && sortConfig.field === field && (
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
        {(hierarchyList ?? displayAgents.map(a => ({ agent: a, depth: 0 }))).map(({ agent, depth }, idx) => {
          const selected = selectedIds.has(agent.id);
          const isDragging = dragIdx === idx;
          return (
            <div
              key={agent.id}
              role="option"
              aria-selected={selected}
              tabIndex={0}
              draggable={isDraggable}
              onClick={(e) => toggle(agent.id, idx, (e as React.MouseEvent).shiftKey, (e as React.MouseEvent).ctrlKey || (e as React.MouseEvent).metaKey)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") toggle(agent.id, idx, e.shiftKey, e.ctrlKey || e.metaKey); }}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={e => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              style={{
                ...rowStyle,
                paddingLeft: 16 + depth * 12,
                background: selected ? "rgba(59,130,246,0.1)" : isDragging ? "rgba(59,130,246,0.2)" : "transparent",
                borderTop: isDragging ? "2px solid #3b82f6" : undefined,
                opacity: isDragging ? 0.5 : 1,
              }}
            >
              {isDraggable && (
                <span style={{ cursor: "grab", color: "#555", display: "flex", marginRight: 4 }}>
                  <GripVertical size={14} />
                </span>
              )}
              {isHierarchy && depth > 0 && (
                <span style={{ display: "flex", alignItems: "center", color: "#3f3f46", marginRight: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M0 6 L6 6 M6 0 L6 12" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </span>
              )}
              <input
                type="checkbox"
                checked={selected}
                readOnly
                style={{ cursor: "pointer", pointerEvents: "none" }}
              />
              <div style={{ marginLeft: 10, flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "flex", alignItems: "center", color: "#a1a1aa" }}>
                    <AgentIcon iconName={agent.icon} />
                  </span>
                  <span
                    title={agent.title && agent.title !== agent.name ? `${agent.name} - ${agent.title}` : agent.name}
                    style={{ fontSize: 13, fontWeight: 500, color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  >
                    {agent.name}
                    {agent.title && agent.title !== agent.name && (
                      <span style={{ fontSize: 11, fontWeight: 400, color: "#71717a", marginLeft: 6 }}>
                        {agent.title}
                      </span>
                    )}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: STATUS_COLORS[agent.status] ?? "#555" }} />
                  <span style={{ fontSize: 11, color: "#888" }}>{agent.status}</span>
                  <span style={{
                    fontSize: 10,
                    padding: "0 6px",
                    borderRadius: 4,
                    background: hexToRgba10(ROLE_COLORS[agent.role] ?? "#3f3f46"),
                    color: ROLE_COLORS[agent.role] ?? "#3f3f46",
                    lineHeight: "18px",
                    fontWeight: 600
                  }}>
                    {agent.role}
                  </span>
                  <span style={{ fontSize: 11, color: "#555" }}>{agent.adapterType}</span>
                </div>
              </div>
              <button
                type="button"
                title="Open agent configuration"
                onClick={(e) => { e.stopPropagation(); window.open(`/${window.location.pathname.split("/")[1]}/agents/${agent.urlKey}/configuration`, "_blank"); }}
                style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#555", display: "flex", padding: "4px", borderRadius: 4, flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#a1a1aa")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
              >
                <ExternalLink size={12} />
              </button>
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
