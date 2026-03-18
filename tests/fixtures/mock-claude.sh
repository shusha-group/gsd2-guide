#!/usr/bin/env bash
# mock-claude.sh — mock claude CLI for subprocess tests.
#
# Behaviour controlled by env vars:
#   MOCK_EXIT_CODE     — exit code to return (default: 0)
#   MOCK_WRITE_PATH    — if set, write canned MDX to this absolute path
#   MOCK_BAD_FRONTMATTER — if "1", write MDX without --- markers
#   MOCK_MODEL         — model name in stream-json init (default: claude-sonnet-4-20250514)
#   MOCK_DURATION_MS   — duration in stream-json result (default: 1234)
#   MOCK_SUBTYPE       — result subtype (default: success)
#   MOCK_STDERR        — if set, write this string to stderr
#   MOCK_CAPTURE_STDIN — if set to a file path, save stdin to that file

# Handle --version (findClaude calls this)
for arg in "$@"; do
  if [ "$arg" = "--version" ]; then
    echo "mock-claude 1.0.0"
    exit 0
  fi
done

# Read stdin (the user message prompt)
STDIN_CONTENT=$(cat)

# Optionally capture stdin for test inspection
if [ -n "$MOCK_CAPTURE_STDIN" ]; then
  echo "$STDIN_CONTENT" > "$MOCK_CAPTURE_STDIN"
fi

# Optionally write stderr
if [ -n "$MOCK_STDERR" ]; then
  echo "$MOCK_STDERR" >&2
fi

# Check for early exit
EXIT_CODE="${MOCK_EXIT_CODE:-0}"
if [ "$EXIT_CODE" != "0" ]; then
  echo '{"type":"system","subtype":"init","model":"'"${MOCK_MODEL:-claude-sonnet-4-20250514}"'"}' 
  echo '{"type":"result","subtype":"error","duration_ms":'"${MOCK_DURATION_MS:-1234}"',"result":"Subprocess error"}' 
  exit "$EXIT_CODE"
fi

# Write canned MDX file if MOCK_WRITE_PATH is set
if [ -n "$MOCK_WRITE_PATH" ]; then
  mkdir -p "$(dirname "$MOCK_WRITE_PATH")"
  if [ "${MOCK_BAD_FRONTMATTER:-0}" = "1" ]; then
    cat > "$MOCK_WRITE_PATH" << 'MDXEOF'
# No frontmatter here

Just content without proper --- markers.
MDXEOF
  else
    cat > "$MOCK_WRITE_PATH" << 'MDXEOF'
---
title: "/gsd test"
description: "Test command"
---

## What It Does

Tests things.

## Usage

```bash
/gsd test
```

## How It Works

It works.

## What Files It Touches

| File | Purpose |
|------|---------|
| test.ts | Tests |

## Examples

Example here.

## Related Commands

- [/gsd doctor](../doctor/)
MDXEOF
  fi
fi

# Emit stream-json output
MODEL="${MOCK_MODEL:-claude-sonnet-4-20250514}"
DURATION="${MOCK_DURATION_MS:-1234}"
SUBTYPE="${MOCK_SUBTYPE:-success}"

echo '{"type":"system","subtype":"init","model":"'"$MODEL"'"}'
echo '{"type":"assistant","message":{"content":[{"type":"text","text":"Working on it..."}]}}'
echo '{"type":"result","subtype":"'"$SUBTYPE"'","duration_ms":'"$DURATION"',"result":"Page updated."}'

exit 0
