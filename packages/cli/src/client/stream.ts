/**
 * Parse a Mastra agent SSE stream and yield text chunks.
 *
 * Mastra v1.x uses Server-Sent Events with JSON payloads:
 *   data: {"type":"text-delta","payload":{"text":"..."}}
 *   data: {"type":"error","payload":{"error":{"message":"..."}}}
 *   data: [DONE]
 */
export async function* parseTextStream(
  response: Response,
): AsyncGenerator<string> {
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
            yield event.payload.text;
          } else if (event.type === "error") {
            const msg =
              event.payload?.error?.message ?? JSON.stringify(event.payload);
            throw new Error(`Server error: ${msg}`);
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue; // skip malformed JSON
          throw err;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
