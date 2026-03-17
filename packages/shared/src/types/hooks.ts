export type HookEvent =
  | "SessionStart"
  | "UserPromptSubmit"
  | "PreToolUse"
  | "PostToolUse";

export interface HookConfig {
  event: HookEvent;
  command: string;
  timeout?: number;
}
