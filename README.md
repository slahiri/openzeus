# OpenZeus

Your personal AI agent, right in the terminal. Ask questions, get streaming answers, build workflows — all from the command line.

## Install

```bash
git clone https://github.com/slahiri/openzeus.git
cd openzeus
pnpm install
```

## Setup

1. Copy the example env and add your API key:

```bash
cp .env.example packages/server/.env
```

2. Edit `packages/server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

3. Build:

```bash
pnpm build
```

## Usage

Start the server:

```bash
pnpm dev
```

Ask a question (one-shot):

```bash
openzeus -p "What is the capital of France?"
```

### Options

| Flag | Description |
|------|-------------|
| `-p "query"` | One-shot mode — prints the answer and exits |
| `--server-url <url>` | Connect to a different server (default: `http://localhost:4112`) |

## ZEUS.md

Drop a `ZEUS.md` file in your project root to give the agent custom instructions. It works like a system prompt scoped to your project.

```markdown
# ZEUS.md
Always respond in bullet points. Focus on Python examples.
```

The agent follows these instructions in every conversation.

## Roadmap

- [x] Streaming CLI with one-shot mode
- [ ] Interactive REPL with multi-turn chat
- [ ] Sessions — resume conversations by name
- [ ] Tools — web search, file read/write
- [ ] Permission system for tool approval
- [ ] Self-building connectors (agent generates its own API integrations)
- [ ] Multi-agent workflows with specialist delegation
- [ ] Memory — the agent remembers your preferences across sessions
- [ ] Cost tracking and local LLM support

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

Apache 2.0 — see [LICENSE](LICENSE).
