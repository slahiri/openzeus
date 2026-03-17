/**
 * Parse a Mastra agent SSE stream and yield typed events.
 *
 * Mastra v1.x SSE format:
 *   data: {"type":"text-delta","payload":{"text":"..."}}
 *   data: {"type":"tool-call","payload":{"toolCallId":"...","toolName":"...","args":{...}}}
 *   data: {"type":"tool-result","payload":{"toolCallId":"...","toolName":"...","result":{...}}}
 *   data: {"type":"error","payload":{"error":{"message":"..."}}}
 *   data: [DONE]
 */

export interface TextDelta {
  type: "text-delta";
  text: string;
}

export interface ToolCallEvent {
  type: "tool-call";
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
}

export interface ToolResultEvent {
  type: "tool-result";
  toolCallId: string;
  toolName: string;
  result: unknown;
  isError?: boolean;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type StreamEvent = TextDelta | ToolCallEvent | ToolResultEvent | ErrorEvent;

export async function* parseStream(
  response: Response,
): AsyncGenerator<StreamEvent> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") return;

        try {
          const event = JSON.parse(data);

          if (event.type === "text-delta" && event.payload?.text) {
            yield { type: "text-delta", text: event.payload.text };
          } else if (event.type === "tool-call" && event.payload) {
            yield {
              type: "tool-call",
              toolCallId: event.payload.toolCallId,
              toolName: event.payload.toolName,
              args: event.payload.args,
            };
          } else if (event.type === "tool-result" && event.payload) {
            yield {
              type: "tool-result",
              toolCallId: event.payload.toolCallId,
              toolName: event.payload.toolName,
              result: event.payload.result,
              isError: event.payload.isError,
            };
          } else if (event.type === "error") {
            const msg =
              event.payload?.error?.message ?? JSON.stringify(event.payload);
            yield { type: "error", message: msg };
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue;
          throw err;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Convenience wrapper: yields only text deltas (backwards compat with M1/M2).
 */
export async function* parseTextStream(
  response: Response,
): AsyncGenerator<string> {
  for await (const event of parseStream(response)) {
    if (event.type === "text-delta") {
      yield event.text;
    } else if (event.type === "error") {
      throw new Error(`Server error: ${event.message}`);
    }
  }
}
