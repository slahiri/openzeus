import React from "react";
import { Box, Text } from "ink";
import InkSpinner from "ink-spinner";

export function ThinkingSpinner() {
  return (
    <Box marginTop={1}>
      <Text color="yellow">
        <InkSpinner type="dots" />
      </Text>
      <Text color="gray"> Thinking...</Text>
    </Box>
  );
}
