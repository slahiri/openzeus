export interface SlashResult {
  handled: boolean;
  clear?: boolean;
  exit?: boolean;
  message?: string;
}

type SlashHandler = (
  args: string,
  context: SlashContext,
) => SlashResult | Promise<SlashResult>;

export interface SlashContext {
  sessionId: string;
  rename: (name: string) => void;
  clearMessages: () => void;
}

const commands: Record<string, { description: string; handler: SlashHandler }> =
  {
    help: {
      description: "Show available commands",
      handler: () => {
        const lines = Object.entries(commands)
          .map(([name, cmd]) => `  /${name} — ${cmd.description}`)
          .join("\n");
        return { handled: true, message: `Available commands:\n${lines}` };
      },
    },
    clear: {
      description: "Clear conversation and start fresh",
      handler: (_args, ctx) => {
        ctx.clearMessages();
        return { handled: true, clear: true, message: "Conversation cleared." };
      },
    },
    compact: {
      description: "Summarize and compact conversation history",
      handler: () => {
        return {
          handled: true,
          message: "Compact not yet implemented — coming soon.",
        };
      },
    },
    rename: {
      description: "Rename this session",
      handler: (args, ctx) => {
        const name = args.trim();
        if (!name) {
          return { handled: true, message: "Usage: /rename <name>" };
        }
        ctx.rename(name);
        return { handled: true, message: `Session renamed to "${name}".` };
      },
    },
    exit: {
      description: "Exit the REPL",
      handler: () => {
        return { handled: true, exit: true };
      },
    },
  };

export function isSlashCommand(input: string): boolean {
  return input.startsWith("/");
}

export async function handleSlashCommand(
  input: string,
  context: SlashContext,
): Promise<SlashResult> {
  const spaceIdx = input.indexOf(" ");
  const name = (spaceIdx === -1 ? input.slice(1) : input.slice(1, spaceIdx)).toLowerCase();
  const args = spaceIdx === -1 ? "" : input.slice(spaceIdx + 1);

  const command = commands[name];
  if (!command) {
    return {
      handled: true,
      message: `Unknown command: /${name}. Type /help for available commands.`,
    };
  }

  return command.handler(args, context);
}
