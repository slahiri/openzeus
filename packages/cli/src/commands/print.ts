import { sendStreamRequest } from "../client/api.js";
import { parseTextStream } from "../client/stream.js";
import type { Message } from "@openzeus/shared";

export async function printCommand(
  query: string,
  serverUrl: string,
): Promise<void> {
  const messages: Message[] = [{ role: "user", content: query }];

  let fullResponse = "";

  try {
    const response = await sendStreamRequest(messages, { serverUrl });

    for await (const chunk of parseTextStream(response)) {
      fullResponse += chunk;
      process.stdout.write(chunk);
    }

    // If nothing was streamed or output doesn't end with newline, add one
    if (fullResponse && !fullResponse.endsWith("\n")) {
      process.stdout.write("\n");
    }
  } catch (err) {
    if (
      err instanceof TypeError &&
      (err as NodeJS.ErrnoException).code === "ECONNREFUSED"
    ) {
      console.error(
        "Error: Cannot connect to OpenZeus server. Is it running?",
      );
      console.error("Start it with: pnpm dev");
      process.exit(1);
    }
    throw err;
  }
}
