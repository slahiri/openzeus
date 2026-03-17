import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, dirname, relative } from "node:path";

export const readFileTool = createTool({
  id: "read_file",
  description:
    "Read the contents of a file. Returns the file content as text.",
  inputSchema: z.object({
    path: z.string().describe("Path to the file to read"),
  }),
  execute: async (input) => {
    try {
      const content = readFileSync(input.path, "utf-8");
      return { content, path: input.path, size: content.length };
    } catch (err) {
      return {
        error: `Failed to read file: ${(err as Error).message}`,
        path: input.path,
      };
    }
  },
});

export const writeFileTool = createTool({
  id: "write_file",
  description:
    "Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Creates parent directories as needed.",
  inputSchema: z.object({
    path: z.string().describe("Path to the file to write"),
    content: z.string().describe("Content to write to the file"),
  }),
  execute: async (input) => {
    try {
      const dir = dirname(input.path);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(input.path, input.content, "utf-8");
      return {
        success: true,
        path: input.path,
        size: input.content.length,
      };
    } catch (err) {
      return {
        error: `Failed to write file: ${(err as Error).message}`,
        path: input.path,
      };
    }
  },
});

export const listFilesTool = createTool({
  id: "list_files",
  description:
    "List files and directories in a given path. Returns names and types (file/directory).",
  inputSchema: z.object({
    path: z.string().describe("Directory path to list"),
    recursive: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to list recursively"),
  }),
  execute: async (input) => {
    try {
      if (!existsSync(input.path)) {
        return { error: `Directory not found: ${input.path}` };
      }

      const entries = listDir(input.path, input.recursive, input.path);
      return { path: input.path, entries, count: entries.length };
    } catch (err) {
      return { error: `Failed to list directory: ${(err as Error).message}` };
    }
  },
});

function listDir(
  dirPath: string,
  recursive: boolean,
  basePath: string,
): Array<{ name: string; type: "file" | "directory"; size?: number }> {
  const results: Array<{
    name: string;
    type: "file" | "directory";
    size?: number;
  }> = [];

  const items = readdirSync(dirPath);
  for (const item of items) {
    if (item.startsWith(".")) continue; // skip hidden files

    const fullPath = join(dirPath, item);
    const stat = statSync(fullPath);
    const relPath = relative(basePath, fullPath);

    if (stat.isDirectory()) {
      results.push({ name: relPath, type: "directory" });
      if (recursive) {
        results.push(...listDir(fullPath, true, basePath));
      }
    } else {
      results.push({ name: relPath, type: "file", size: stat.size });
    }
  }

  return results;
}
