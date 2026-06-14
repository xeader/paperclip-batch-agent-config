# Batch Agent Config for PaperClip AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](package.json)
[![PaperClip SDK](https://img.shields.io/badge/PaperClip%20SDK-compatible-purple.svg)](https://paperclip.ai)

> **Batch-edit configuration for your PaperClip AI agents**

Batch Agent Config for **PaperClip** is a lightweight yet powerful plugin that lets you update adapters and permissions across many agents with a single action. Whether you need to tune API keys, reorder your org chart or fine‑tune who can create new agents, this plugin brings a bulk‑editing experience directly into your PaperClip workspace.

## 🚀 Highlights

- **Mass‑edit multiple agents at once** — select a handful or your entire team and apply configuration changes in one go.
- **Three display modes** — _Auto_ (alphabetical), _Manual_ (drag‑and‑drop) and _Hierarchy_ (respecting `reportsTo` relationships) make it easy to view and reorder your agent list.
- **Rich multi‑selection** — click to toggle an agent, `Shift+Click` to select a range and `Ctrl`/`⌘+Click` to select or deselect an agent _and all its descendants_ recursively.
- **Drag‑and‑drop reordering** — reorder agents manually or within sibling groups in hierarchy mode; your preferred order is saved locally and restored on next load.
- **Fine‑grained adapter control** — update base URL/host, API key and concurrency for each agent. Each field offers a **“Keep current”** option so you never overwrite settings unintentionally.
- **Granular permissions editing** — manage whether agents can create new agents or assign tasks with a three‑state selector (_Keep current / Allow / Deny_) and an optional **Skip Permissions** toggle for advanced workflows.
- **State persistence** — selection state, manual order and hierarchy preferences are stored in your browser so you can pick up where you left off.

## 🧭 Quick‑Start Guide

### Compatibility

| Requirement | Version |
|---|---|
| **PaperClip SDK** | `latest` |
| **Node.js** | `>=18` |
| **React** | `^18.2.0` |
| **TypeScript** | `^5.4.0` |

### Installation & Setup

1. **Clone the repository** into your PaperClip plugins directory and install dependencies:

    ```bash
    git clone https://github.com/xeader/paperclip-batch-agent-config.git
    cd batch-agent-config
    npm install
    ```

2. **Build the plugin** and register it with PaperClip:

    ```bash
    npm run build
    ```

   Then follow the [PaperClip plugin documentation](https://paperclip.ai/docs/plugins) to add the built plugin to your PaperClip instance.

1. **Access the UI** by navigating to `{company-id}/batch-agent-config` in your PaperClip dashboard or by clicking the **Batch Agent Config** link in the sidebar.

### Selecting Agents

The top pane shows your agents. Use the search bar to filter by name or title. Each row displays the agent’s name, optional title badge, role badge and quick‑action buttons. The role badge uses a soft colour scheme (the text uses the full role colour while the background uses a 10 % tint) to keep the focus on the agent’s name.

You can select agents in several ways:

|Action|Effect|
|---|---|
|**Click**|Toggle selection of a single agent.|
|**Shift + Click**|Select a contiguous range between the last clicked agent and the current one.|
|**Ctrl/⌘ + Click**|Toggle selection of an agent and _all its descendants_ (useful in hierarchy mode).|
|**Select All / Clear** buttons|Quickly select all agents or clear the current selection.|

Hover over a truncated name to see the full name and title as a tooltip. Click the external‑link icon to open that agent’s detailed configuration in a new tab.

### Sorting & Viewing Modes

Use the sort selector in the top right to switch between three modes:

1. **Auto** — displays agents alphabetically by name. This is ideal when you just need a simple list view.
2. **Manual** — lets you drag and drop agents to define a custom order. A drag handle appears when this mode is active. Your manual order is persisted in local storage.
3. **Hierarchy** — constructs a tree from the `reportsTo` relationships. Agents are indented by depth and sibling groups can be reordered via drag and drop. The hierarchical order is also persisted locally. In this mode you cannot drag an agent outside its sibling group; children always stay under their parent.

### Editing Adapter & Permissions Settings

When you select one or more agents, a configuration form appears on the right. Fields are grouped by category (Adapter settings, Permissions, Advanced options). For each field you can choose:

- **Keep current** — leave the agent’s existing value unchanged.
- **Override** — supply a new value (string input, numeric input or toggle depending on the field).

Adapter settings include base URL/host, API key and concurrency. Permissions include the ability to create new agents and assign tasks. A _Skip Permissions_ toggle allows advanced users to temporarily bypass the default permission checks.

Once you have configured the desired overrides, click **Apply** to update all selected agents. A summary will show how many updates succeeded and how many failed. If you need to revert changes, you can clear all fields or reload the page.

### Saving & Presets

Your manual or hierarchical order preferences are stored in your browser’s local storage, so when you reload the page your customised order is restored. Multi‑selection state is also preserved. There is currently no global “preset” export, but the underlying implementation makes it straightforward to add this in future versions.

### Drag & Drop Tips

- In **Manual** mode you can reorder agents freely by dragging the handle on the left.
- In **Hierarchy** mode you can only reorder within a sibling group; children always stay below their parent.

The plugin automatically persists the new order to local storage.

### Keyboard Shortcuts

The plugin has been designed to feel like a traditional list view. The following shortcuts work on the agent list:

- `Enter` or `Space` — toggle the selected agent when the row is focused (makes the UI accessible via keyboard).
- `Shift + Click` — select a range between two agents.
- `Ctrl/⌘ + Click` — select/deselect an agent and its descendants.

## 🎥 Demo & Screenshots

### Select agents, drag to reorder and apply changes

![[demo.mp4]]

### Agent list in hierarchy mode with multi‑selection

![[agent-list.png]]

### Configuration form 

![[config-panel.png]]

### Development

```bash
# Start development mode with hot reload
npm run dev

# Type-check without emitting
npm run typecheck

# Run tests
npm run test

# Production build
npm run build
```

## 🙌 Contributing

Contributions are welcome! We strive to make this repository accessible to newcomers and experienced developers alike. If you would like to contribute:

1. **Start by reading the existing [CONTRIBUTING.md](CONTRIBUTING.md)** file. It explains our workflow, coding standards and how to run the test suite. You can also open a “Good first issue” to get started.
2. **Be kind and inclusive.** Adopting a [Code of Conduct](CODE_OF_CONDUCT.md) and welcoming newcomers helps foster a positive community. We encourage first‑time contributors to ask for help—we’re here to support you!
3. **Label your issues appropriately.** Use labels like _good first issue_, _help wanted_ or _documentation_ so others can easily find tasks.
4. **Open pull requests early and often.** Branches should be short‑lived; merge small, focused changes regularly. Each PR should explain the problem and how to test the proposed fix.
5. **Write tests and documentation.** Documentation and tests are as important as code. When adding features or fixing bugs, please update the relevant docs and add or update tests.

If you find the plugin useful, **please give the repository a star on GitHub** and share it with others. Stars help signal interest and encourage continued maintenance and improvement.

## 🤝 Community & Support

This project is maintained by [Xeader](https://www.xeader.com). If you encounter any bugs, have suggestions or need help using the plugin:

- **Open an issue** on GitHub with a clear description and steps to reproduce.
- **Join discussions** to ask questions or propose features.
- **Reach out** via email at `info@xeader.com`.

## ⚖️ License

This plugin is distributed under the [MIT License](LICENSE). See the [LICENSE](LICENSE) file for details.

## 🌟 Final words

PaperClip opens up a world where teams of autonomous agents collaborate to achieve complex goals. **Batch Agent Config for PaperClip AI** streamlines the management of those agents, saving you time and letting you focus on higher‑level strategy. We hope this plugin becomes an essential part of your PaperClip toolkit. If it does, don’t forget to ⭐ the repo and share it with your network!

---

Made with ❤️ by [Xeader](https://www.xeader.com)
