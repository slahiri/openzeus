import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

export type HookEvent =
  | "SessionStart"
  | "UserPromptSubmit"
  | "PreToolUse"
  | "PostToolUse";

interface HookConfig {
  event: HookEvent;
  command: string;
  timeout?: number;
}

interface HooksSettings {
  hooks?: HookConfig[];
}

let cachedHooks: HookConfig[] | null = null;

/**
 * Load hooks from .zeus/settings.json in the given directory.
 */
export function loadHooks(cwd: string): HookConfig[] {
  if (cachedHooks !== null) return cachedHooks;

  const settingsPath = join(cwd, ".zeus", "settings.json");
  if (!existsSync(settingsPath)) {
    cachedHooks = [];
    return cachedHooks;
  }

  try {
    const settings: HooksSettings = JSON.parse(
      readFileSync(settingsPath, "utf-8"),
    );
    cachedHooks = settings.hooks || [];
    return cachedHooks;
  } catch {
    cachedHooks = [];
    return cachedHooks;
  }
}

export interface HookContext {
  event: HookEvent;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  userInput?: string;
  sessionId?: string;
}

export interface HookResult {
  allowed: boolean;
  output?: string;
}

/**
 * Run all hooks matching the given event.
 * Returns { allowed: false } if any hook exits with code 2 (block).
 * Exit code 0 = allow, exit code 2 = block, anything else = ignore.
 */
export function runHooks(cwd: string, context: HookContext): HookResult {
  const hooks = loadHooks(cwd);
  const matching = hooks.filter((h) => h.event === context.event);

  for (const hook of matching) {
    try {
      const env = {
        ...process.env,
        ZEUS_EVENT: context.event,
        ZEUS_TOOL_NAME: context.toolName || "",
        ZEUS_TOOL_ARGS: context.toolArgs
          ? JSON.stringify(context.toolArgs)
          : "",
        ZEUS_USER_INPUT: context.userInput || "",
        ZEUS_SESSION_ID: context.sessionId || "",
      };

      const output = execSync(hook.command, {
        cwd,
        timeout: hook.timeout || 10000,
        env,
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
      });

      return { allowed: true, output: output.trim() };
    } catch (err) {
      const exitCode = (err as { status?: number }).status;
      if (exitCode === 2) {
        return {
          allowed: false,
          output: (err as { stdout?: string }).stdout?.trim() || "Blocked by hook",
        };
      }
      // Other exit codes: ignore and continue
    }
  }

  return { allowed: true };
}
