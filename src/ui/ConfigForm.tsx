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

type TernaryBool = "" | "true" | "false";

const CHROME_OPTIONS: { value: TernaryBool | "enable"; label: string }[] = [
  { value: "", label: "Keep current" },
  { value: "enable", label: "Enable" },
  { value: "false", label: "Disable" },
];

function OverridableText({
  value,
  onChange,
  placeholder,
  showReset,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  showReset: boolean;
}) {
  const [overridden, setOverridden] = useState(value !== "");

  if (!overridden) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 13, color: "#71717a", fontStyle: "italic" }}>Keep current</span>
        <button
          type="button"
          onClick={() => setOverridden(true)}
          style={{
            ...toggleBtnStyle,
            background: "transparent",
            color: "#a1a1aa",
            border: "1px solid #444",
            padding: "2px 10px",
          }}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
      {showReset && (
        <button
          type="button"
          onClick={() => { onChange(""); setOverridden(false); }}
          style={{
            ...toggleBtnStyle,
            color: "#ef4444",
            fontSize: 11,
            whiteSpace: "nowrap",
          }}
        >
          Reset
        </button>
      )}
    </div>
  );
}

export function ConfigForm({ onApply, applying, selectedCount, results }: ConfigFormProps) {
  const [adapterType, setAdapterType] = useState("");
  const [model, setModel] = useState("");
  const [cheapModel, setCheapModel] = useState("");
  const [cheapModelEnabled, setCheapModelEnabled] = useState<TernaryBool>("");
  const [command, setCommand] = useState("");
  const [thinkingEffort, setThinkingEffort] = useState("");
  const [chromeOption, setChromeOption] = useState<TernaryBool | "enable">("");
  const [extraArgs, setExtraArgs] = useState("");
  const [skipPermissions, setSkipPermissions] = useState<TernaryBool>("");
  const [canCreateAgents, setCanCreateAgents] = useState<TernaryBool>("");
  const [canAssignTasks, setCanAssignTasks] = useState<TernaryBool>("");

  const modelData = usePluginData("getAdapterModels", { adapterType: adapterType || "opencode_local" });
  const modelResult = modelData.data as { models: string[] } | undefined;
  const models: string[] = modelResult?.models ?? [];

  const handleApply = useCallback(() => {
    const adapterConfig: Record<string, unknown> = {};
    if (model) adapterConfig.model = model;
    if (command) adapterConfig.command = command;
    if (thinkingEffort) adapterConfig.thinkingEffort = thinkingEffort;
    if (chromeOption === "enable") { adapterConfig.chrome = true; adapterConfig.headless = false; }
    if (chromeOption === "false") { adapterConfig.chrome = false; adapterConfig.headless = true; }
    if (extraArgs.trim()) adapterConfig.extraArgs = extraArgs.split(" ").filter(Boolean);
    if (skipPermissions === "true") { adapterConfig.dangerouslySkipPermissions = true; adapterConfig.skipPermissions = true; }
    if (skipPermissions === "false") { adapterConfig.dangerouslySkipPermissions = false; adapterConfig.skipPermissions = false; }

    const config: BatchConfigDelta = {};
    if (adapterType) config.adapterType = adapterType;
    if (Object.keys(adapterConfig).length > 0) config.adapterConfig = adapterConfig;
    if (cheapModelEnabled !== "" || cheapModel) {
      const cheap = {
        enabled: cheapModelEnabled !== "false",
        adapterConfig: cheapModel ? { model: cheapModel } : {},
      };
      config.runtimeConfig = { modelProfiles: { cheap } };
    }

    if (canCreateAgents !== "" || canAssignTasks !== "") {
      config.permissions = {
        canCreateAgents: canCreateAgents === "true" ? true : canCreateAgents === "false" ? false : false,
        canAssignTasks: canAssignTasks === "true" ? true : canAssignTasks === "false" ? false : false,
      };
    }

    onApply(config);
  }, [adapterType, model, cheapModel, cheapModelEnabled, command, thinkingEffort, chromeOption, extraArgs, skipPermissions, canCreateAgents, canAssignTasks, onApply]);

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
        fontSize: 13, fontWeight: 600, color: "#e4e4e7",
        paddingBottom: 8, marginBottom: 16, borderBottom: "1px solid #333",
      }}>
        {title}
      </h3>
    );
  }

  function ternarySelect(value: TernaryBool, onChange: (v: TernaryBool) => void, trueLabel: string, falseLabel: string) {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value as TernaryBool)} style={selectStyle}>
        <option value="">Keep current</option>
        <option value="true">{trueLabel}</option>
        <option value="false">{falseLabel}</option>
      </select>
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
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <select value={adapterType} onChange={(e) => setAdapterType(e.target.value)} style={selectStyle}>
            <option value="">Keep current</option>
            {ADAPTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            How this agent runs: local CLI (Claude/Codex/OpenCode), spawned process, or generic HTTP webhook.
          </span>
        </div>
      ))}

      {fieldRow("Model", (
        <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
          <OverridableText value={model} onChange={setModel} placeholder="e.g. claude-sonnet-4-20250514" showReset={true} />
          {model && models.length > 0 && (
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
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Override the default model used by the adapter.
          </span>
        </div>
      ))}

      {fieldRow("Cheap Model", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <select value={cheapModelEnabled} onChange={(e) => setCheapModelEnabled(e.target.value as TernaryBool)} style={selectStyle}>
            <option value="">Keep current</option>
            <option value="true">Enable</option>
            <option value="false">Disable</option>
          </select>
          {cheapModelEnabled === "true" && (
            <OverridableText value={cheapModel} onChange={setCheapModel} placeholder="e.g. claude-hdk-20250101" showReset={true} />
          )}
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Used when a run requests the cheap profile (e.g. routine summaries). The primary model stays unchanged.
          </span>
        </div>
      ))}

      {fieldRow("Command", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <OverridableText value={command} onChange={setCommand} placeholder="e.g. npx opencode" showReset={true} />
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            The command to execute (e.g. npx opencode, claude, codex).
          </span>
        </div>
      ))}

      {fieldRow("Thinking Effort", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <select value={thinkingEffort} onChange={(e) => setThinkingEffort(e.target.value)} style={selectStyle}>
            <option value="">Keep current</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Control model reasoning depth. Supported values vary by adapter/model.
          </span>
        </div>
      ))}

      {fieldRow("Enable Chrome", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <select value={chromeOption} onChange={(e) => setChromeOption(e.target.value as TernaryBool | "enable")} style={selectStyle}>
            {CHROME_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Enable Claude's Chrome integration by passing --chrome.
          </span>
        </div>
      ))}

      {fieldRow("Extra Args", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <OverridableText value={extraArgs} onChange={setExtraArgs} placeholder="--flag1, --flag2, --foo=bar" showReset={true} />
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Additional CLI arguments passed to the adapter. Comma-separated.
          </span>
        </div>
      ))}

      {sectionTitle("Permissions & Configuration")}

      {fieldRow("Skip Permissions", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <select value={skipPermissions} onChange={(e) => setSkipPermissions(e.target.value as TernaryBool)} style={selectStyle}>
            <option value="">Keep current</option>
            <option value="true">Enable</option>
            <option value="false">Disable</option>
          </select>
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Run unattended by auto-approving adapter permission prompts when supported.
          </span>
        </div>
      ))}

      {fieldRow("Can create new agents", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ternarySelect(canCreateAgents, setCanCreateAgents, "Allow", "Deny")}
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            Lets this agent create or hire agents and implicitly assign tasks.
          </span>
        </div>
      ))}
      {fieldRow("Can assign tasks", (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ternarySelect(canAssignTasks, setCanAssignTasks, "Allow", "Deny")}
          <span style={{ fontSize: 11, color: "#71717a", fontStyle: "italic" }}>
            When overridden by company-wide defaults, the effective permission may still show as enabled in the Paperclip UI.
          </span>
        </div>
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
          {applying ? "Applying..." : `Apply to ${selectedCount} agent${selectedCount !== 1 ? "s" : ""}`}
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
                  padding: "6px 12px", fontSize: 12, borderRadius: 6, marginBottom: 4,
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
  flex: 1,
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

const toggleBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 12,
  borderRadius: 4,
  border: "none",
  cursor: "pointer",
};
