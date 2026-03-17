import React, { useMemo } from "react";
import { Box, Text } from "ink";

interface MessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  streaming?: boolean;
}

export function Message({ role, content, streaming }: MessageProps) {
  if (role === "system") {
    return (
      <Box marginY={0}>
        <Text color="gray" italic>
          {content}
        </Text>
      </Box>
    );
  }

  if (role === "user") {
    return (
      <Box marginTop={1}>
        <Text color="blue" bold>
          {"You: "}
        </Text>
        <Text>{content}</Text>
      </Box>
    );
  }

  // Assistant message — render as plain text for now.
  // Markdown rendering via marked-terminal will be added when stabilized.
  return (
    <Box marginTop={1} flexDirection="column">
      <Text color="green" bold>
        {"Zeus: "}
      </Text>
      <Text>
        {content}
        {streaming ? "▊" : ""}
      </Text>
    </Box>
  );
}
