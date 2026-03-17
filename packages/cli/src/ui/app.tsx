import React, { useState, useCallback } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { Prompt } from "./prompt.js";
import { Message } from "./message.js";
import { ThinkingSpinner } from "./spinner.js";
import { sendStreamRequest } from "../client/api.js";
import { parseTextStream } from "../client/stream.js";
import {
  isSlashCommand,
  handleSlashCommand,
  type SlashContext,
} from "../slash/index.js";
import { touchSession, renameSession } from "../session/store.js";
import { loadZeusInstructions, loadRules } from "../zeus/loader.js";
import type { Message as Msg } from "@openzeus/shared";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface AppProps {
  serverUrl: string;
  sessionId: string;
  threadId: string;
  sessionName?: string;
  cwd: string;
}

export function App({
  serverUrl,
  sessionId,
  threadId,
  sessionName,
  cwd,
}: AppProps) {
  const { exit } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [currentName, setCurrentName] = useState(sessionName);

  // Load ZEUS.md instructions once
  const [zeusInstructions] = useState(() => {
    const zeus = loadZeusInstructions(cwd);
    const rules = loadRules(cwd);
    const parts = [zeus, rules].filter(Boolean);
    return parts.join("\n\n");
  });

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
      setMessages([]);
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
          setMessages([]);
        }
        if (result.message) {
          setMessages((prev) => [
            ...(result.clear ? [] : prev),
            { role: "system", content: result.message! },
          ]);
        }
        return;
      }

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: input }]);
      setStreaming(true);
      setStreamText("");

      // Build messages for API
      const apiMessages: Msg[] = [];

      // Inject ZEUS.md as system message on first turn
      if (zeusInstructions && messages.filter((m) => m.role === "user").length === 0) {
        apiMessages.push({
          role: "system",
          content: `Project instructions (ZEUS.md):\n\n${zeusInstructions}`,
        });
      }

      // Add conversation history (only user/assistant)
      for (const m of messages) {
        if (m.role !== "system") {
          apiMessages.push({ role: m.role, content: m.content });
        }
      }

      // Add current user message
      apiMessages.push({ role: "user", content: input });

      try {
        const response = await sendStreamRequest(apiMessages, {
          serverUrl,
          threadId,
          resourceId: sessionId,
        });

        let fullText = "";
        for await (const chunk of parseTextStream(response)) {
          fullText += chunk;
          setStreamText(fullText);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: fullText },
        ]);
        touchSession(sessionId);
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : "Unknown error occurred";
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error: ${errMsg}` },
        ]);
      } finally {
        setStreaming(false);
        setStreamText("");
      }
    },
    [messages, serverUrl, threadId, sessionId, exit, slashContext, zeusInstructions],
  );

  return (
    <Box flexDirection="column" paddingX={1}>
      {/* Header */}
      <Box marginBottom={1}>
        <Text color="cyan" bold>
          ⚡ OpenZeus
        </Text>
        <Text color="gray">
          {currentName ? ` (${currentName})` : ""} — Type /help for commands,
          Ctrl+C to exit
        </Text>
      </Box>

      {/* ZEUS.md indicator */}
      {zeusInstructions && (
        <Text color="gray" dimColor>
          ZEUS.md loaded
        </Text>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <Message key={i} role={msg.role} content={msg.content} />
      ))}

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
