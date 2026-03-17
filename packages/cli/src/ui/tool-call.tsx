import React from "react";
import { Box, Text } from "ink";

interface ToolCallDisplayProps {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
  duration?: number;
  verbose?: boolean;
}

function summarizeArgs(args: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(args)) {
    if (typeof value === "string") {
      const display = value.length > 60 ? value.slice(0, 57) + "..." : value;
      parts.push(`${key}="${display}"`);
    } else if (typeof value === "number" || typeof value === "boolean") {
      parts.push(`${key}=${value}`);
    }
  }
  return parts.join(", ");
}

function summarizeResult(result: unknown): string {
  if (result === null || result === undefined) return "null";
  if (typeof result === "string") {
    return result.length > 80 ? result.slice(0, 77) + "..." : result;
  }
  if (typeof result === "object") {
    const obj = result as Record<string, unknown>;
    if (obj.error) return `error: ${obj.error}`;
    if (obj.content) return `${(obj.content as string).length} chars`;
    if (obj.results && Array.isArray(obj.results)) {
      return `${obj.results.length} results`;
    }
    if (obj.entries && Array.isArray(obj.entries)) {
      return `${obj.entries.length} entries`;
    }
    if (obj.success) return "done";
    const json = JSON.stringify(result);
    return json.length > 80 ? json.slice(0, 77) + "..." : json;
  }
  return String(result);
}

export function ToolCallDisplay({
  toolName,
  args,
  result,
  isError,
  duration,
  verbose,
}: ToolCallDisplayProps) {
  const argSummary = args ? summarizeArgs(args) : "";
  const durationStr = duration ? ` (${(duration / 1000).toFixed(1)}s)` : "";

  if (result !== undefined) {
    // Completed tool call
    const resultSummary = summarizeResult(result);
    return (
      <Box marginY={0}>
        <Text color={isError ? "red" : "yellow"}>
          {"  [tool] "}
        </Text>
        <Text color={isError ? "red" : "white"}>
          {toolName}({argSummary})
        </Text>
        <Text color="gray">
          {" → "}
          {resultSummary}
          {durationStr}
        </Text>
      </Box>
    );
  }

  // In-progress tool call
  return (
    <Box marginY={0}>
      <Text color="yellow">{"  [tool] "}</Text>
      <Text>{toolName}({argSummary})</Text>
      <Text color="gray"> running...</Text>
    </Box>
  );
}
