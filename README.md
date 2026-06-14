# Batch Agent Config

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](package.json)
[![Build Status](https://img.shields.io/github/actions/workflow/status/xeader/batch-agent-config/ci.yml?branch=main)](https://github.com/xeader/batch-agent-config/actions)
[![PaperClip SDK](https://img.shields.io/badge/PaperClip%20SDK-compatible-purple.svg)](https://paperclip.ai)

> A [PaperClip](https://paperclip.ai) plugin to edit adapter and permissions configuration for multiple agents at once.

**Developed by [Xeader](https://www.xeader.com)** — info@xeader.com

---

### Features

- **Batch editing** — Update adapter and permissions configuration across multiple agents simultaneously
- **Page & Sidebar UI** — Accessible as a dedicated page or from the sidebar within PaperClip
- **Intuitive interface** — Clean React-based UI for fast, bulk configuration changes
- **Seamless integration** — Built on the official PaperClip Plugin SDK

### Why Batch Agent Config?

Managing agents one by one is tedious and error-prone. This plugin lets you select multiple agents and apply configuration changes in a single operation, saving time and reducing mistakes.

---

### Compatibility

| Requirement | Version |
|---|---|
| **PaperClip SDK** | `latest` |
| **Node.js** | `>=18` |
| **React** | `^18.2.0` |
| **TypeScript** | `^5.4.0` |

---

### Installation

1. Clone the repository into your PaperClip plugins directory:

   ```bash
   git clone https://github.com/xeader/batch-agent-config.git
   cd batch-agent-config
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the plugin:

   ```bash
   npm run build
   ```

4. Register the plugin in your PaperClip instance following the [PaperClip plugin documentation](https://paperclip.ai/docs/plugins).

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

---

### Usage

Once installed, the plugin adds:

1. **A new page** — Navigate to `/batch-agent-config` in PaperClip to access the full batch configuration interface.
2. **A sidebar link** — Quick access from the PaperClip sidebar.

<!-- TODO: Add screenshots
![Batch Config Page](docs/screenshots/page.png)
![Sidebar Link](docs/screenshots/sidebar.png)
-->

Select the agents you want to configure, adjust adapter and permissions settings, and apply changes to all selected agents at once.

---

### Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

### Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

### License

This project is licensed under the [MIT License](LICENSE).

---

Made with ❤️ by [Xeader](https://www.xeader.com)
