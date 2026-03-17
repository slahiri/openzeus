# OpenZeus

A personal AI agent framework built on [Mastra](https://mastra.ai). Inspired by [OpenClaw](https://github.com/openclaw), with a CLI experience modeled after Claude Code.

OpenZeus lets you run a local AI agent server with memory, tools, and multi-agent workflows — controlled entirely from your terminal.

## Features

- **CLI-first** — interactive REPL and one-shot mode, streaming markdown to your terminal
- **Built on Mastra** — leverages Mastra's agent framework, memory, tools, and workflows
- **Session memory** — multi-turn conversations with persistent context
- **Extensible tools** — web search, file operations, and self-building connectors (coming soon)
- **Multi-agent workflows** — coordinator delegates to specialist agents (coming soon)
- **ZEUS.md** — project-level instructions that shape agent behavior (like CLAUDE.md)

## Quick Start

### Prerequisites

- Node.js >= 20
- pnpm >= 10

### Install

```bash
git clone https://github.com/slahiri/openzeus.git
cd openzeus
pnpm install
```

### Configure

Create a `.env` file in `packages/server/`:

```bash
cp .env.example packages/server/.env
```

Edit `packages/server/.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

### Build

```bash
pnpm --filter @openzeus/shared build
pnpm --filter @openzeus/cli build
```

### Run

Start the server:

```bash
pnpm dev
```

In another terminal, run a query:

```bash
node packages/cli/dist/bin/openzeus.js -p "What is the capital of France?"
```

## Architecture

```
openzeus/
├── packages/
│   ├── server/     # Mastra-based AI agent server
│   ├── cli/        # Terminal client (Commander.js + SSE streaming)
│   └── shared/     # Shared types and protocol definitions
```

### Server (`packages/server`)

The server is a [Mastra](https://mastra.ai) instance that hosts AI agents. It auto-generates REST API endpoints for each agent, including streaming via Server-Sent Events.

- **Agent:** `assistant` — a general-purpose agent powered by Claude Sonnet
- **Memory:** LibSQL-backed conversation memory with configurable message history
- **API:** `POST /api/agents/assistant/stream` — send messages, receive streamed responses

### CLI (`packages/cli`)

A thin HTTP/SSE client that connects to the Mastra server. All intelligence lives server-side.

- `-p "query"` — one-shot print mode, streams response to stdout
- `--server-url <url>` — override server URL (default: `http://localhost:4112`)

### Shared (`packages/shared`)

TypeScript types for messages, sessions, API paths, and stream events shared between server and CLI.

## ZEUS.md

Create a `ZEUS.md` file in your project root to give the agent project-specific instructions — similar to how `CLAUDE.md` works with Claude Code. The agent will follow these instructions in every conversation.

## Roadmap

- [x] **M1:** Monorepo skeleton + single agent + CLI streaming
- [ ] **M2:** Interactive REPL + sessions + ZEUS.md loading
- [ ] **M3:** Tools + permissions + hooks
- [ ] **M4:** Self-building connectors
- [ ] **M5:** Multi-agent workflows + trip planning
- [ ] **M6:** Memory tiers + LiteLLM + cost tracking + observability

## Development

```bash
pnpm dev                              # Start Mastra dev server
pnpm --filter @openzeus/shared build  # Build shared types
pnpm --filter @openzeus/cli build     # Build CLI
pnpm build                            # Build all packages
```

The Mastra dev server watches for file changes and hot-reloads automatically.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

Apache 2.0 — see [LICENSE](LICENSE).
