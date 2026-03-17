import { Command } from "commander";
import { DEFAULT_SERVER_URL } from "@openzeus/shared";
import { printCommand } from "./commands/print.js";

export function createProgram() {
  const program = new Command();

  program
    .name("openzeus")
    .description("OpenZeus AI Agent CLI")
    .version("0.1.0");

  program
    .option("-p, --print <query>", "Send a one-shot query and print the response")
    .option("--server-url <url>", "Server URL", DEFAULT_SERVER_URL)
    .action(async (opts) => {
      if (opts.print) {
        await printCommand(opts.print, opts.serverUrl);
      } else {
        console.log("Interactive mode coming in M2. Use -p for now.");
        console.log('Example: openzeus -p "What is the capital of France?"');
      }
    });

  return program;
}
