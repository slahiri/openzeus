import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { webSearchTool } from "../tools/web-search.js";
import {
  readFileTool,
  writeFileTool,
  listFilesTool,
} from "../tools/workspace-tools.js";

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
Be concise and helpful. Use markdown formatting when appropriate.

You have access to tools for searching the web and working with files.
Use them when the user's request would benefit from real-time information or file operations.
Always tell the user what tool you're using and why.`,
  model: anthropic("claude-sonnet-4-6"),
  memory,
  tools: {
    web_search: webSearchTool,
    read_file: readFileTool,
    write_file: writeFileTool,
    list_files: listFilesTool,
  },
});
