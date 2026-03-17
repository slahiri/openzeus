import { API_PATHS, DEFAULT_SERVER_URL } from "@openzeus/shared";
import type { Message } from "@openzeus/shared";

export interface StreamOptions {
  serverUrl?: string;
  agentId?: string;
  threadId?: string;
  resourceId?: string;
}

export async function sendStreamRequest(
  messages: Message[],
  options: StreamOptions = {},
): Promise<Response> {
  const {
    serverUrl = DEFAULT_SERVER_URL,
    agentId = "assistant",
    threadId,
    resourceId,
  } = options;

  const url = `${serverUrl}${API_PATHS.agentStream(agentId)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      threadId,
      resourceId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status} ${response.statusText}`);
  }

  return response;
}
