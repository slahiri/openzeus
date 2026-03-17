import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface PermissionPromptProps {
  toolName: string;
  args: Record<string, unknown>;
  onDecision: (approved: boolean) => void;
}

export function PermissionPrompt({
  toolName,
  args,
  onDecision,
}: PermissionPromptProps) {
  const [decided, setDecided] = useState(false);

  useInput(
    (input) => {
      if (decided) return;
      const lower = input.toLowerCase();
      if (lower === "y") {
        setDecided(true);
        onDecision(true);
      } else if (lower === "n") {
        setDecided(true);
        onDecision(false);
      }
    },
    { isActive: !decided },
  );

  const argDisplay = Object.entries(args)
    .map(([k, v]) => {
      const val = typeof v === "string" ? v : JSON.stringify(v);
      const display = val.length > 60 ? val.slice(0, 57) + "..." : val;
      return `    ${k}: ${display}`;
    })
    .join("\n");

  return (
    <Box flexDirection="column" marginY={1} borderStyle="round" borderColor="yellow" paddingX={1}>
      <Text color="yellow" bold>
        Tool requires approval:
      </Text>
      <Text color="white" bold>
        {toolName}
      </Text>
      <Text color="gray">{argDisplay}</Text>
      <Box marginTop={1}>
        <Text color="cyan">Allow? </Text>
        <Text color="green" bold>[y]</Text>
        <Text color="gray">/</Text>
        <Text color="red" bold>[n]</Text>
      </Box>
    </Box>
  );
}
