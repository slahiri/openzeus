import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

interface PromptProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function Prompt({ onSubmit, disabled }: PromptProps) {
  const [value, setValue] = useState("");
  const [cursor, setCursor] = useState(0);

  useInput(
    (input, key) => {
      if (disabled) return;

      if (key.return) {
        const trimmed = value.trim();
        if (trimmed) {
          onSubmit(trimmed);
          setValue("");
          setCursor(0);
        }
        return;
      }

      if (key.backspace || key.delete) {
        if (cursor > 0) {
          setValue((v) => v.slice(0, cursor - 1) + v.slice(cursor));
          setCursor((c) => c - 1);
        }
        return;
      }

      if (key.leftArrow) {
        setCursor((c) => Math.max(0, c - 1));
        return;
      }

      if (key.rightArrow) {
        setCursor((c) => Math.min(value.length, c + 1));
        return;
      }

      if (input && !key.ctrl && !key.meta) {
        setValue((v) => v.slice(0, cursor) + input + v.slice(cursor));
        setCursor((c) => c + input.length);
      }
    },
    { isActive: !disabled },
  );

  const before = value.slice(0, cursor);
  const cursorChar = value[cursor] ?? " ";
  const after = value.slice(cursor + 1);

  return (
    <Box>
      <Text color="cyan" bold>
        {"› "}
      </Text>
      <Text>
        {before}
        <Text inverse>{cursorChar}</Text>
        {after}
      </Text>
    </Box>
  );
}
