export const DEFAULT_SERVER_URL = "http://localhost:4112";

export const API_PATHS = {
  agentStream: (agentId: string) => `/api/agents/${agentId}/stream`,
  sessionInit: "/api/openzeus/session/init",
} as const;
