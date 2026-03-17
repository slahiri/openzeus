# OpenZeus

Personal AI agent framework built on Mastra. Inspired by OpenClaw, CLI emulates Claude Code.

## Development

```bash
pnpm dev              # Start Mastra server on :4112
pnpm --filter @openzeus/cli build   # Build CLI
node packages/cli/dist/bin/openzeus.js -p "query"  # One-shot query
```

## Structure

- `packages/server` — Mastra-based AI server
- `packages/cli` — Terminal client (Commander.js)
- `packages/shared` — Shared types and protocol definitions

## Environment

Requires `ANTHROPIC_API_KEY` in `packages/server/.env`.
