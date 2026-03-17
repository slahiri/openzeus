import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

/**
 * Load ZEUS.md content from the current project and user home.
 * Scans: ./ZEUS.md, ~/.zeus/ZEUS.md
 * Supports @path imports in ZEUS.md files.
 */
export function loadZeusInstructions(cwd: string): string {
  const parts: string[] = [];

  // Project-level ZEUS.md
  const projectZeus = join(cwd, "ZEUS.md");
  if (existsSync(projectZeus)) {
    parts.push(resolveImports(readFileSync(projectZeus, "utf-8"), cwd));
  }

  // User-level ZEUS.md
  const userZeus = join(homedir(), ".zeus", "ZEUS.md");
  if (existsSync(userZeus)) {
    parts.push(
      resolveImports(readFileSync(userZeus, "utf-8"), join(homedir(), ".zeus")),
    );
  }

  return parts.join("\n\n---\n\n");
}

/**
 * Load rules from .zeus/rules/*.md in the project directory.
 */
export function loadRules(cwd: string): string {
  const rulesDir = join(cwd, ".zeus", "rules");
  if (!existsSync(rulesDir)) return "";

  const files = readdirSync(rulesDir).filter((f) => f.endsWith(".md")).sort();
  const parts: string[] = [];

  for (const file of files) {
    const content = readFileSync(join(rulesDir, file), "utf-8");
    parts.push(content);
  }

  return parts.join("\n\n");
}

/**
 * Resolve @path imports in ZEUS.md content.
 * Lines like `@path/to/file.md` are replaced with the file's content.
 */
function resolveImports(content: string, baseDir: string): string {
  return content.replace(/^@(.+)$/gm, (_match, filePath: string) => {
    const resolved = join(baseDir, filePath.trim());
    if (existsSync(resolved)) {
      return readFileSync(resolved, "utf-8");
    }
    return `<!-- Could not resolve: ${filePath} -->`;
  });
}
