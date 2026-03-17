export type StreamEventType =
  | "text-delta"
  | "tool-call-start"
  | "tool-call-result"
  | "error"
  | "done";

export interface StreamEvent {
  type: StreamEventType;
  data: unknown;
}

export interface TextDeltaEvent {
  type: "text-delta";
  data: { text: string };
}

export interface ToolCallStartEvent {
  type: "tool-call-start";
  data: { id: string; name: string; args: Record<string, unknown> };
}

export interface ToolCallResultEvent {
  type: "tool-call-result";
  data: { id: string; name: string; result: unknown };
}
