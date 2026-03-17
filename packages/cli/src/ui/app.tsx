import React, { useState, useCallback, useRef } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Prompt } from "./prompt.js";
import { Message } from "./message.js";
import { ToolCallDisplay } from "./tool-call.js";
import { ThinkingSpinner } from "./spinner.js";
import { sendStreamRequest } from "../client/api.js";
import { parseStream, type StreamEvent } from "../client/stream.js";
import {
  isSlashCommand,
  handleSlashCommand,
  type SlashContext,
} from "../slash/index.js";
import { touchSession, renameSession } from "../session/store.js";
import { loadZeusInstructions, loadRules } from "../zeus/loader.js";
import { runHooks, loadHooks } from "../hooks/engine.js";
import { requiresApproval, type PermissionMode } from "@openzeus/shared";
import type { Message as Msg } from "@openzeus/shared";

interface DisplayItem {
  id: string;
  type: "user" | "assistant" | "system" | "tool-call" | "tool-result";
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: unknown;
  isError?: boolean;
  duration?: number;
}

interface AppProps {
  serverUrl: string;
  sessionId: string;
  threadId: string;
  sessionName?: string;
  cwd: string;
  permissionMode: PermissionMode;
  verbose?: boolean;
}

let itemCounter = 0;
function nextId() {
  return `item-${++itemCounter}`;
}

export function App({
  serverUrl,
  sessionId,
  threadId,
  sessionName,
  cwd,
  permissionMode,
  verbose,
}: AppProps) {
  const { exit } = useApp();
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [currentName, setCurrentName] = useState(sessionName);
  const messagesRef = useRef<Array<{ role: "user" | "assistant"; content: string }>>([]);

  // Load ZEUS.md instructions once
  const [zeusInstructions] = useState(() => {
    const zeus = loadZeusInstructions(cwd);
    const rules = loadRules(cwd);
    const parts = [zeus, rules].filter(Boolean);
    return parts.join("\n\n");
  });

  // Load hooks
  useState(() => loadHooks(cwd));

  // Ctrl+C / Ctrl+D to exit
  useInput((_input, key) => {
    if (key.ctrl && (_input === "c" || _input === "d")) {
      exit();
    }
  });

  const slashContext: SlashContext = {
    sessionId,
    rename: (name: string) => {
      renameSession(sessionId, name);
      setCurrentName(name);
    },
    clearMessages: () => {
      setItems([]);
      messagesRef.current = [];
    },
  };

  const handleSubmit = useCallback(
    async (input: string) => {
      // Slash commands
      if (isSlashCommand(input)) {
        const result = await handleSlashCommand(input, slashContext);
        if (result.exit) {
          exit();
          return;
        }
        if (result.clear) {
          setItems([]);
          messagesRef.current = [];
        }
        if (result.message) {
          setItems((prev) => [
            ...(result.clear ? [] : prev),
            { id: nextId(), type: "system", content: result.message! },
          ]);
        }
        return;
      }

      // Run UserPromptSubmit hooks
      const promptHook = runHooks(cwd, {
        event: "UserPromptSubmit",
        userInput: input,
        sessionId,
      });
      if (!promptHook.allowed) {
        setItems((prev) => [
          ...prev,
          { id: nextId(), type: "system", content: `Blocked: ${promptHook.output}` },
        ]);
        return;
      }

      // Add user message
      setItems((prev) => [
        ...prev,
        { id: nextId(), type: "user", content: input },
      ]);
      messagesRef.current.push({ role: "user", content: input });
      setStreaming(true);
      setStreamText("");

      // Build messages for API
      const apiMessages: Msg[] = [];

      // Inject ZEUS.md on first turn
      if (zeusInstructions && messagesRef.current.filter((m) => m.role === "user").length <= 1) {
        apiMessages.push({
          role: "system",
          content: `Project instructions (ZEUS.md):\n\n${zeusInstructions}`,
        });
      }

      // Add conversation history
      for (const m of messagesRef.current) {
        apiMessages.push({ role: m.role, content: m.content });
      }

      try {
        const response = await sendStreamRequest(apiMessages, {
          serverUrl,
          threadId,
          resourceId: sessionId,
        });

        let fullText = "";
        const toolTimers = new Map<string, number>();

        for await (const event of parseStream(response)) {
          switch (event.type) {
            case "text-delta":
              fullText += event.text;
              setStreamText(fullText);
              break;

            case "tool-call": {
              toolTimers.set(event.toolCallId, Date.now());

              // Run PreToolUse hooks
              const preHook = runHooks(cwd, {
                event: "PreToolUse",
                toolName: event.toolName,
                toolArgs: event.args,
                sessionId,
              });

              setItems((prev) => [
                ...prev,
                {
                  id: nextId(),
                  type: "tool-call",
                  content: "",
                  toolName: event.toolName,
                  toolArgs: event.args,
                },
              ]);

              if (!preHook.allowed) {
                setItems((prev) => [
                  ...prev,
                  {
                    id: nextId(),
                    type: "system",
                    content: `Tool ${event.toolName} blocked by hook: ${preHook.output}`,
                  },
                ]);
              }
              break;
            }

            case "tool-result": {
              const startTime = toolTimers.get(event.toolCallId);
              const duration = startTime ? Date.now() - startTime : undefined;

              // Run PostToolUse hooks
              runHooks(cwd, {
                event: "PostToolUse",
                toolName: event.toolName,
                toolResult: event.result,
                sessionId,
              });

              setItems((prev) => [
                ...prev,
                {
                  id: nextId(),
                  type: "tool-result",
                  content: "",
                  toolName: event.toolName,
                  toolResult: event.result,
                  isError: event.isError,
                  duration,
                },
              ]);
              break;
            }

            case "error":
              setItems((prev) => [
                ...prev,
                { id: nextId(), type: "system", content: `Error: ${event.message}` },
              ]);
              break;
          }
        }

        if (fullText) {
          messagesRef.current.push({ role: "assistant", content: fullText });
          setItems((prev) => [
            ...prev,
            { id: nextId(), type: "assistant", content: fullText },
          ]);
        }
        touchSession(sessionId);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setItems((prev) => [
          ...prev,
          { id: nextId(), type: "system", content: `Error: ${errMsg}` },
        ]);
      } finally {
        setStreaming(false);
        setStreamText("");
      }
    },
    [serverUrl, threadId, sessionId, exit, slashContext, zeusInstructions, cwd, permissionMode],
  );

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          ⚡ OpenZeus
        </Text>
        <Text color="gray">
          {currentName ? ` (${currentName})` : ""}
          {permissionMode !== "default" ? ` [${permissionMode}]` : ""}
          {" — Type /help for commands, Ctrl+C to exit"}
        </Text>
      </Box>

      {/* ZEUS.md indicator */}
      {zeusInstructions && (
        <Text color="gray" dimColor>
          ZEUS.md loaded
        </Text>
      )}

      {/* Display items */}
      {items.map((item) => {
        switch (item.type) {
          case "user":
          case "assistant":
          case "system":
            return <Message key={item.id} role={item.type} content={item.content} />;
          case "tool-call":
            return (
              <ToolCallDisplay
                key={item.id}
                toolName={item.toolName!}
                args={item.toolArgs}
                verbose={verbose}
              />
            );
          case "tool-result":
            return (
              <ToolCallDisplay
                key={item.id}
                toolName={item.toolName!}
                result={item.toolResult}
                isError={item.isError}
                duration={item.duration}
                verbose={verbose}
              />
            );
          default:
            return null;
        }
      })}

      {/* Streaming response */}
      {streaming && streamText && (
        <Message role="assistant" content={streamText} streaming />
      )}

      {/* Thinking spinner */}
      {streaming && !streamText && <ThinkingSpinner />}

      {/* Input prompt */}
      <Box marginTop={1}>
        <Prompt onSubmit={handleSubmit} disabled={streaming} />
      </Box>
    </Box>
  );
}
