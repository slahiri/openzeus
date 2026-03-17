import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

const memory = new Memory({
  storage: new LibSQLStore({
    id: "openzeus-storage",
    url: ":memory:",
  }),
  options: {
    lastMessages: 40,
  },
});

export const assistantAgent = new Agent({
  id: "assistant",
  name: "assistant",
  instructions: `You are Zeus, a helpful AI assistant. You are part of the OpenZeus framework.
Be concise and helpful. Use markdown formatting when appropriate.`,
  model: anthropic("claude-sonnet-4-6"),
  memory,
});
