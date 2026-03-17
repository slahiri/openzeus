import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistant.js";

export const mastra = new Mastra({
  agents: { assistant: assistantAgent },
});
