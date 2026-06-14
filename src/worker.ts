import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";

interface AgentInfo {
  id: string;
  name: string;
  urlKey: string;
  role: string;
  title: string | null;
  icon: string | null;
  status: string;
  adapterType: string;
}

interface AgentConfiguration {
  id: string;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
  runtimeConfig: Record<string, unknown>;
  permissions: {
    canCreateAgents: boolean;
    canAssignTasks: boolean;
  };
  defaultEnvironmentId: string | null;
  budgetMonthlyCents: number;
}

interface BatchConfigDelta {
  adapterType?: string;
  adapterConfig?: Record<string, unknown>;
  runtimeConfig?: Record<string, unknown>;
  permissions?: {
    canCreateAgents?: boolean;
    canAssignTasks?: boolean;
  };
  defaultEnvironmentId?: string | null;
}

function getApiBase(): string {
  return process.env.PAPERCLIP_API_URL || "http://127.0.0.1:3100";
}

function getApiKey(): string | undefined {
  return process.env.PAPERCLIP_API_KEY;
}

function authHeaders(): Record<string, string> {
  const apiKey = getApiKey();
  if (apiKey) {
    return { Authorization: `Bearer ${apiKey}` };
  }
  return {};
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBase()}/api${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} for ${url}: ${body}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 200)}`);
  }
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.logger.info("Batch Agent Config plugin starting");

    ctx.data.register("listAgents", async (params: Record<string, unknown>) => {
      const { companyId } = params as { companyId: string };
      ctx.logger.info("Listing agents", { companyId });
      const agents = await apiFetch<AgentInfo[]>(
        `/companies/${companyId}/agents`
      );
      return { agents };
    });

    ctx.data.register("getAgentConfig", async (params: Record<string, unknown>) => {
      const { agentId } = params as { agentId: string };
      ctx.logger.info("Fetching agent config", { agentId });
      const config = await apiFetch<AgentConfiguration>(
        `/agents/${agentId}/configuration`
      );
      return { config };
    });

    ctx.data.register("getAdapterModels", async (params: Record<string, unknown>) => {
      const { adapterType } = params as { adapterType: string };
      ctx.logger.info("Fetching adapter models", { adapterType });
      try {
        const models = await apiFetch<{ models: string[] }>(
          `/adapters/${adapterType}/models`
        );
        return models;
      } catch {
        return { models: [] };
      }
    });

    ctx.actions.register(
      "batchUpdate",
      async (params: Record<string, unknown>) => {
        const { agentIds, config } = params as {
          agentIds: string[];
          config: BatchConfigDelta;
        };
        ctx.logger.info("Batch updating agents", {
          count: agentIds.length,
          fields: Object.keys(config),
        });

        const results: Array<{ agentId: string; success: boolean; error?: string }> = [];

        for (const agentId of agentIds) {
          try {
            if (config.permissions) {
              await apiFetch(`/agents/${agentId}/permissions`, {
                method: "PATCH",
                body: JSON.stringify(config.permissions),
              });
            }

            const { permissions: _, ...agentUpdate } = config;
            if (Object.keys(agentUpdate).length > 0) {
              await apiFetch(`/agents/${agentId}`, {
                method: "PATCH",
                body: JSON.stringify(agentUpdate),
              });
            }

            results.push({ agentId, success: true });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            ctx.logger.error("Batch update failed for agent", {
              agentId,
              error: message,
            });
            results.push({ agentId, success: false, error: message });
          }
        }

        return { results };
      }
    );
  },
});

export default plugin;
runWorker(plugin, import.meta.url);
