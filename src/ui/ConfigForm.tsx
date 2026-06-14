import { useState, useCallback } from "react";
import { usePluginData } from "@paperclipai/plugin-sdk/ui";
import type { BatchConfigDelta } from "./types";

interface ConfigFormProps {
  onApply: (config: BatchConfigDelta) => Promise<void>;
  applying: boolean;
  selectedCount: number;
  results: Array<{ agentId: string; success: boolean; error?: string; agentName?: string }> | null;
}

const ADAPTER_TYPES = [
  "acpx_local",
  "claude_local",
  "codex_local",
  "cursor",
  "gemini_local",
  "opencode_local",
  "pi_local",
];

const THINKING_EFFORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function ConfigForm({ onApply, applying, selectedCount, results }: ConfigFormProps) {
  const [adapterType, setAdapterType] = useState("");
  const [model, setModel] = useState("");
  const [cheapModel, setCheapModel] = useState("");
  const [command, setCommand] = useState("");
  const [thinkingEffort, setThinkingEffort] = useState("");
  const [enableChrome, setEnableChrome] = useState(false);
  const [extraArgs, setExtraArgs] = useState("");
  const [skipPermissions, setSkipPermissions] = useState(false);

  const modelData = usePluginData("getAdapterModels", { adapterType: adapterType || "opencode_local" });
  const modelResult = modelData.data as { models: string[] } | undefined;
  const models: string[] = modelResult?.models ?? [];

  const handleApply = useCallback(() => {
    const adapterConfig: Record<string, unknown> = {};

    if (model) adapterConfig.model = model;
    if (command) adapterConfig.command = command;
    if (thinkingEffort) adapterConfig.thinkingEffort = thinkingEffort;
    if (enableChrome) adapterConfig.headless = false;
    if (extraArgs.trim()) adapterConfig.extraArgs = extraArgs.split(" ").filter(Boolean);

    const config: BatchConfigDelta = {};

    if (adapterType) config.adapterType = adapterType;
    if (Object.keys(adapterConfig).length > 0) config.adapterConfig = adapterConfig;

    if (cheapModel) {
      config.runtimeConfig = {
        modelProfiles: {
          cheap: {
            enabled: true,
            adapterConfig: { model: cheapModel },
          },
        },
      };
    }

    if (skipPermissions) {
      config.permissions = {
        canAssignTasks: true,
      };
    }

    onApply(config);
  }, [adapterType, model, cheapModel, command, thinkingEffort, enableChrome, extraArgs, skipPermissions, onApply]);

  const canApply = selectedCount > 0 && !applying;

  function fieldRow(label: string, children: React.ReactNode) {
    return (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
        <div style={{ width: 160, minWidth: 160, paddingTop: 6, fontSize: 12, fontWeight: 500, color: "#a1a1aa" }}>
          {label}
        </div>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    );
  }

  function sectionTitle(title: string) {
    return (
      <h3 style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#e4e4e7",
        paddingBottom: 8,
        marginBottom: 16,
        borderBottom: "1px solid #333",
      }}>
        {title}
      </h3>
    );
  }

  const successCount = results?.filter((r) => r.success).length ?? 0;
  const failCount = results?.filter((r) => !r.success).length ?? 0;

  return (
    <div style={{ padding: 24, maxWidth: 640 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: "#f4f4f5", marginBottom: 4 }}>
        Batch Agent Configuration
      </h1>
      <p style={{ fontSize: 12, color: "#71717a", marginBottom: 24 }}>
        Select agents on the left, then configure settings below and apply them in bulk.
      </p>

      {sectionTitle("Adapter")}

      {fieldRow("Adapter Type", (
        <select
          value={adapterType}
          onChange={(e) => setAdapterType(e.target.value)}
          style={selectStyle}
        >
          <option value="">Keep current</option>
          {ADAPTER_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      ))}

      {fieldRow("Model", (
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g. claude-sonnet-4-20250514"
            style={inputStyle}
          />
          {models.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {models.slice(0, 10).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(model === m ? "" : m)}
                  style={{
                    ...chipStyle,
                    background: model === m ? "#3b82f6" : "#27272a",
                    color: model === m ? "#fff" : "#a1a1aa",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {fieldRow("Cheap Model", (
        <input
          type="text"
          value={cheapModel}
          onChange={(e) => setCheapModel(e.target.value)}
          placeholder="e.g. claude-hdk-20250101"
          style={inputStyle}
        />
      ))}

      {fieldRow("Command", (
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. npx opencode"
          style={inputStyle}
        />
      ))}

      {fieldRow("Thinking Effort", (
        <select
          value={thinkingEffort}
          onChange={(e) => setThinkingEffort(e.target.value)}
          style={selectStyle}
        >
          {THINKING_EFFORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}

      {fieldRow("Enable Chrome", (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#d4d4d8" }}>
          <input
            type="checkbox"
            checked={enableChrome}
            onChange={(e) => setEnableChrome(e.target.checked)}
          />
          Enable headless browser
        </label>
      ))}

      {fieldRow("Extra Args", (
        <input
          type="text"
          value={extraArgs}
          onChange={(e) => setExtraArgs(e.target.value)}
          placeholder="--flag1 --flag2 value"
          style={inputStyle}
        />
      ))}

      {sectionTitle("Permissions & Configuration")}

      {fieldRow("Skip Permissions", (
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#d4d4d8" }}>
          <input
            type="checkbox"
            checked={skipPermissions}
            onChange={(e) => setSkipPermissions(e.target.checked)}
          />
          Allow agent to create agents and assign tasks
        </label>
      ))}

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #333" }}>
        <button
          type="button"
          onClick={handleApply}
          disabled={!canApply}
          style={{
            ...applyBtnStyle,
            opacity: canApply ? 1 : 0.5,
            cursor: canApply ? "pointer" : "not-allowed",
          }}
        >
          {applying
            ? "Applying..."
            : `Apply to ${selectedCount} agent${selectedCount !== 1 ? "s" : ""}`}
        </button>
      </div>

      {results && results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#71717a", marginBottom: 8 }}>
            {successCount} succeeded, {failCount} failed
          </div>
          <div style={{ maxHeight: 240, overflow: "auto" }}>
            {results.map((r) => (
              <div
                key={r.agentId}
                style={{
                  padding: "6px 12px",
                  fontSize: 12,
                  borderRadius: 6,
                  marginBottom: 4,
                  background: r.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                  color: r.success ? "#22c55e" : "#ef4444",
                }}
              >
                {r.agentName}: {r.success ? "Updated" : `Failed - ${r.error}`}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 13,
  borderRadius: 6,
  border: "1px solid #444",
  background: "#18181b",
  color: "#e4e4e7",
  outline: "none",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 10px",
  fontSize: 13,
  borderRadius: 6,
  border: "1px solid #444",
  background: "#18181b",
  color: "#e4e4e7",
  outline: "none",
};

const chipStyle: React.CSSProperties = {
  padding: "2px 8px",
  fontSize: 11,
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
};

const applyBtnStyle: React.CSSProperties = {
  padding: "8px 24px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 8,
  border: "none",
  background: "#3b82f6",
  color: "#fff",
};
