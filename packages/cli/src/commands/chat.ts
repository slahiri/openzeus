import React from "react";
import { render } from "ink";
import { App } from "../ui/app.js";
import {
  createSession,
  getLastSession,
  getSessionByName,
} from "../session/store.js";

interface ChatOptions {
  serverUrl: string;
  continue?: boolean;
  resume?: string;
  name?: string;
}

export async function chatCommand(opts: ChatOptions): Promise<void> {
  let session;

  if (opts.continue) {
    session = getLastSession();
    if (!session) {
      console.error("No previous session found. Starting a new one.");
      session = createSession();
    }
  } else if (opts.resume) {
    session = getSessionByName(opts.resume);
    if (!session) {
      console.error(`Session "${opts.resume}" not found. Starting a new one.`);
      session = createSession(opts.resume);
    }
  } else {
    session = createSession(opts.name);
  }

  const { waitUntilExit } = render(
    React.createElement(App, {
      serverUrl: opts.serverUrl,
      sessionId: session.id,
      threadId: session.threadId,
      sessionName: session.name,
      cwd: process.cwd(),
    }),
  );

  await waitUntilExit();
}
