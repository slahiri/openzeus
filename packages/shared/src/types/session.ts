export interface Session {
  id: string;
  threadId: string;
  name?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface SessionInitRequest {
  cwd: string;
  sessionName?: string;
}

export interface SessionInitResponse {
  threadId: string;
  resourceId: string;
}
