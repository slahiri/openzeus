# Contributing to OpenZeus

Thanks for your interest in contributing! OpenZeus is an open source project and we welcome contributions of all kinds.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/openzeus.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b my-feature`

## Development Setup

```bash
# Install dependencies
pnpm install

# Build shared types (needed first)
pnpm --filter @openzeus/shared build

# Start the dev server (watches for changes)
pnpm dev

# Build the CLI
pnpm --filter @openzeus/cli build
```

You'll need an `ANTHROPIC_API_KEY` in `packages/server/.env` to test agent functionality.

## Project Structure

- `packages/server/` — Mastra-based agent server
- `packages/cli/` — Terminal client
- `packages/shared/` — Shared TypeScript types and protocol definitions

## Making Changes

1. Make your changes on a feature branch
2. Ensure the project builds: `pnpm build`
3. Test your changes manually against the running server
4. Write clear commit messages describing the "why", not just the "what"

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Include a clear description of what changed and why
- Update the README if your change affects user-facing behavior
- Link any related issues

## Code Style

- TypeScript strict mode
- ESM modules (`"type": "module"`)
- Use the existing code patterns as a reference

## Reporting Issues

- Use [GitHub Issues](https://github.com/slahiri/openzeus/issues) to report bugs or request features
- Include steps to reproduce for bugs
- Include your Node.js and pnpm versions

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
