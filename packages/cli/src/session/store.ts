import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { v4 as uuidv4 } from "uuid";
import type { Session } from "@openzeus/shared";

const ZEUS_DIR = join(homedir(), ".zeus");
const SESSIONS_FILE = join(ZEUS_DIR, "sessions.json");

function ensureDir() {
  if (!existsSync(ZEUS_DIR)) {
    mkdirSync(ZEUS_DIR, { recursive: true });
  }
}

function loadSessions(): Session[] {
  ensureDir();
  if (!existsSync(SESSIONS_FILE)) return [];
  try {
    return JSON.parse(readFileSync(SESSIONS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  ensureDir();
  writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function createSession(name?: string): Session {
  const sessions = loadSessions();
  const session: Session = {
    id: uuidv4(),
    threadId: uuidv4(),
    name,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };
  sessions.push(session);
  saveSessions(sessions);
  return session;
}

export function getLastSession(): Session | undefined {
  const sessions = loadSessions();
  if (sessions.length === 0) return undefined;
  return sessions.sort(
    (a, b) =>
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
  )[0];
}

export function getSessionByName(name: string): Session | undefined {
  return loadSessions().find((s) => s.name === name);
}

export function touchSession(id: string) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === id);
  if (session) {
    session.lastActiveAt = new Date().toISOString();
    saveSessions(sessions);
  }
}

export function renameSession(id: string, name: string) {
  const sessions = loadSessions();
  const session = sessions.find((s) => s.id === id);
  if (session) {
    session.name = name;
    saveSessions(sessions);
  }
}

export function listSessions(): Session[] {
  return loadSessions().sort(
    (a, b) =>
      new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime(),
  );
}
