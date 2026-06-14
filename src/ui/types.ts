export interface AgentInfo {
  id: string;
  name: string;
  urlKey: string;
  role: string;
  title: string | null;
  icon: string | null;
  status: string;
  adapterType: string;
}

export interface AgentConfiguration {
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

export interface BatchConfigDelta {
  adapterType?: string;
  adapterConfig?: Record<string, unknown>;
  runtimeConfig?: Record<string, unknown>;
  permissions?: {
    canCreateAgents?: boolean;
    canAssignTasks?: boolean;
  };
  defaultEnvironmentId?: string | null;
}
