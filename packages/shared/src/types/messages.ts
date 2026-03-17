export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface StreamRequest {
  messages: Message[];
  resourceId?: string;
  threadId?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResult {
  id: string;
  name: string;
  result: unknown;
}
