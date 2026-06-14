import { useState } from "react";
import { usePluginData, usePluginAction, useHostContext } from "@paperclipai/plugin-sdk/ui";
import { AgentSelector } from "./AgentSelector";
import { ConfigForm } from "./ConfigForm";
import type { AgentInfo, BatchConfigDelta } from "./types";
import type { PluginPageProps } from "@paperclipai/plugin-sdk/ui";

export function BatchAgentConfigPage(_props: PluginPageProps) {
  const hostContext = useHostContext();
  const companyId = hostContext?.companyId ?? "";

  const agentsData = usePluginData("listAgents", { companyId });
  const agentsLoading = agentsData.loading;
  const agentsError = agentsData.error;
  const agentsResult = agentsData.data as { agents: AgentInfo[] } | undefined;
  const batchUpdate = usePluginAction("batchUpdate");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [applyConfig, setApplyConfig] = useState<BatchConfigDelta | null>(null);
  const [applying, setApplying] = useState(false);
  const [results, setResults] = useState<Array<{ agentId: string; success: boolean; error?: string; agentName?: string }> | null>(null);

  const agents: AgentInfo[] = agentsResult?.agents ?? [];

  async function handleApply(config: BatchConfigDelta) {
    if (selectedIds.size === 0) return;
    setApplying(true);
    setApplyConfig(config);
    setResults(null);

    try {
      const result = await batchUpdate({ companyId, agentIds: Array.from(selectedIds), config }) as { results: Array<{ agentId: string; success: boolean; error?: string }> };
      const namedResults = result.results.map((r) => ({
        ...r,
        agentName: agents.find((a) => a.id === r.agentId)?.name ?? r.agentId,
      }));
      setResults(namedResults);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setResults(selectedIds.size === 1
        ? [{ agentId: Array.from(selectedIds)[0], success: false, error: message, agentName: "Unknown" }]
        : []);
    } finally {
      setApplying(false);
    }
  }

  if (agentsLoading) {
    return <div style={{ padding: 24, color: "#aaa" }}>Loading agents...</div>;
  }

  if (agentsError) {
    return <div style={{ padding: 24, color: "#f44" }}>Error: {agentsError.message}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100%", gap: 0 }}>
      <div style={{ width: 380, minWidth: 380, borderRight: "1px solid #333", overflow: "auto" }}>
        <AgentSelector
          agents={agents}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          companyId={companyId}
        />
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>
        <ConfigForm
          onApply={handleApply}
          applying={applying}
          selectedCount={selectedIds.size}
          results={results}
        />
      </div>
    </div>
  );
}
