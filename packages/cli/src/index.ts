import { Command } from "commander";
import { DEFAULT_SERVER_URL } from "@openzeus/shared";
import { printCommand } from "./commands/print.js";
import { chatCommand } from "./commands/chat.js";

export function createProgram() {
  const program = new Command();

  program
    .name("openzeus")
    .description("OpenZeus AI Agent CLI")
    .version("0.1.0");

  program
    .option("-p, --print <query>", "Send a one-shot query and print the response")
    .option("-c, --continue", "Resume the last session")
    .option("-r, --resume <name>", "Resume a session by name")
    .option("-n, --name <name>", "Name the new session")
    .option("--server-url <url>", "Server URL", DEFAULT_SERVER_URL)
    .action(async (opts) => {
      if (opts.print) {
        await printCommand(opts.print, opts.serverUrl);
      } else {
        await chatCommand({
          serverUrl: opts.serverUrl,
          continue: opts.continue,
          resume: opts.resume,
          name: opts.name,
        });
      }
    });

  return program;
}
