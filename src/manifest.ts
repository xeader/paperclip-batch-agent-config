import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

const manifest: PaperclipPluginManifestV1 = {
  id: "batch-agent-config",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Batch Agent Config",
  description:
    "Edit adapter and permissions configuration for multiple agents at once.",
  author: "antonio",
  categories: ["ui"],
  capabilities: [
    "ui.page.register",
    "ui.sidebar.register",
    "http.outbound",
  ],
  entrypoints: {
    worker: "dist/worker.js",
    ui: "dist/ui",
  },
  ui: {
    slots: [
      {
        type: "page",
        id: "batch-config",
        displayName: "Batch Agent Config",
        exportName: "BatchAgentConfigPage",
        routePath: "batch-agent-config",
      },
      {
        type: "sidebar",
        id: "batch-config-link",
        displayName: "Batch Agent Config",
        exportName: "SidebarLink",
      },
    ],
  },
};

export default manifest;
