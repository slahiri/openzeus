export type PermissionMode = "default" | "plan" | "full-auto";

/**
 * Permission mode behavior:
 * - default: reads auto-approved, writes/executes prompt for approval
 * - plan: all tool calls prompt for approval
 * - full-auto: no approval prompts
 */
export function requiresApproval(
  mode: PermissionMode,
  toolName: string,
): boolean {
  if (mode === "full-auto") return false;
  if (mode === "plan") return true;

  // default mode: reads are auto-approved, writes prompt
  const readTools = ["read_file", "list_files", "web_search"];
  return !readTools.includes(toolName);
}
