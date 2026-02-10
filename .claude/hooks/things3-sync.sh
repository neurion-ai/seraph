#!/bin/bash
# Syncs Claude Code git operations with Things3 tasks via Things3 MCP server.
# - Branch creation  -> Creates a Things3 task (tagged "Seraph", today, in Work project)
# - PR merge         -> Updates task notes with PR info and marks complete
set -uo pipefail

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')
CWD=$(echo "$INPUT" | jq -r '.cwd // ""')

MCP_URL="http://localhost:9100/mcp"
THINGS_PROJECT="🤖Work"
MAPPING_FILE="${HOME}/.claude/things3-tasks.json"
[ -f "$MAPPING_FILE" ] || echo '{}' > "$MAPPING_FILE"

# --- Helper: get or create MCP session ---
SESSION_FILE="${HOME}/.claude/things3-mcp-session"

mcp_session() {
  # Try existing session
  if [ -f "$SESSION_FILE" ]; then
    cat "$SESSION_FILE"
    return
  fi
  # Initialize new session
  RESP=$(curl -sf -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"things3-hook","version":"1.0"}}}' \
    -D - 2>/dev/null)
  SID=$(echo "$RESP" | grep -i "mcp-session-id:" | sed 's/.*: *//;s/\r//')
  if [ -n "$SID" ]; then
    echo "$SID" > "$SESSION_FILE"
    echo "$SID"
  fi
}

# --- Helper: call MCP tool, retry once on session error ---
mcp_call() {
  local tool_name="$1"
  local args_json="$2"
  local sid
  sid=$(mcp_session)
  [ -z "$sid" ] && return 1

  local payload
  payload=$(jq -n --arg name "$tool_name" --argjson args "$args_json" \
    '{"jsonrpc":"2.0","id":99,"method":"tools/call","params":{"name":$name,"arguments":$args}}')

  RESULT=$(curl -sf -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Mcp-Session-Id: $sid" \
    -d "$payload" 2>/dev/null)

  # If session expired, reset and retry once
  if echo "$RESULT" | grep -q "Missing session ID\|Invalid session"; then
    rm -f "$SESSION_FILE"
    sid=$(mcp_session)
    [ -z "$sid" ] && return 1
    RESULT=$(curl -sf -X POST "$MCP_URL" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json, text/event-stream" \
      -H "Mcp-Session-Id: $sid" \
      -d "$payload" 2>/dev/null)
  fi

  echo "$RESULT"
}

# --- Helper: branch slug to title case ---
slugify() {
  echo "$1" | tr '-' ' ' | tr '_' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)}1'
}

# ============================================================
#  BRANCH CREATION: git checkout -b | git switch -c
# ============================================================
if echo "$COMMAND" | grep -qE 'git (checkout -b|switch -c) '; then
  BRANCH=$(echo "$COMMAND" | sed -nE 's/.*(checkout -b|switch -c) +([^ ]+).*/\2/p')
  [ -z "$BRANCH" ] && exit 0

  # Parse type prefix (feat/, fix/, etc.)
  if echo "$BRANCH" | grep -q '/'; then
    TYPE_PREFIX=$(echo "$BRANCH" | cut -d'/' -f1)
    SLUG=$(echo "$BRANCH" | cut -d'/' -f2-)
  else
    TYPE_PREFIX=""
    SLUG="$BRANCH"
  fi

  case "$TYPE_PREFIX" in
    feat|feature)       TYPE_LABEL="Feature" ;;
    fix|bugfix|hotfix)  TYPE_LABEL="Bug Fix" ;;
    refactor)           TYPE_LABEL="Refactor" ;;
    docs)               TYPE_LABEL="Docs" ;;
    test)               TYPE_LABEL="Test" ;;
    chore)              TYPE_LABEL="Chore" ;;
    *)                  TYPE_LABEL="Task" ;;
  esac

  TITLE=$(slugify "$SLUG")
  PROJECT_NAME=$(basename "$CWD")
  FULL_TITLE="${TYPE_LABEL}: ${TITLE}"

  NOTES="Branch: ${BRANCH}
Project: ${PROJECT_NAME}
Type: ${TYPE_LABEL}
Created: $(date '+%Y-%m-%d %H:%M')"

  ARGS=$(jq -n \
    --arg title "$FULL_TITLE" \
    --arg notes "$NOTES" \
    --arg when "today" \
    --arg list_title "$THINGS_PROJECT" \
    '{title: $title, notes: $notes, tags: ["Seraph"], when: $when, list_title: $list_title}')

  mcp_call "add_todo" "$ARGS" > /dev/null 2>&1

  # Search for the task to get its UUID
  sleep 1
  SEARCH_ARGS=$(jq -n --arg q "$FULL_TITLE" '{query: $q}')
  SEARCH_RESULT=$(mcp_call "search_todos" "$SEARCH_ARGS" 2>/dev/null)

  # Extract UUID from the first matching result
  TASK_UUID=$(echo "$SEARCH_RESULT" | grep -o '"text":"[^"]*"' | head -1 | grep -o 'UUID: [A-Za-z0-9]*' | head -1 | awk '{print $2}')

  if [ -n "$TASK_UUID" ]; then
    jq --arg b "$BRANCH" --arg id "$TASK_UUID" '.[$b] = $id' "$MAPPING_FILE" > "${MAPPING_FILE}.tmp" \
      && mv "${MAPPING_FILE}.tmp" "$MAPPING_FILE"
    echo "Things3 task created: ${FULL_TITLE} (${TASK_UUID})" >&2
  else
    echo "Things3 task created: ${FULL_TITLE} (UUID not captured)" >&2
  fi
fi

# ============================================================
#  PR MERGE: gh pr merge
# ============================================================
if echo "$COMMAND" | grep -qE 'gh pr merge'; then
  # Get current branch
  BRANCH=$(git -C "$CWD" branch --show-current 2>/dev/null || echo "")

  # Extract PR number from command (e.g. "gh pr merge 24 --merge")
  PR_NUM=$(echo "$COMMAND" | sed -nE 's/.*gh pr merge ([0-9]+).*/\1/p')

  # If no branch from git, try to get it from PR metadata
  if [ -z "$BRANCH" ] && [ -n "$PR_NUM" ]; then
    BRANCH=$(gh pr view "$PR_NUM" --json headRefName -q '.headRefName' 2>/dev/null || echo "")
  fi

  [ -z "$BRANCH" ] && exit 0

  # Look up task UUID from mapping
  TASK_UUID=$(jq -r --arg b "$BRANCH" '.[$b] // empty' "$MAPPING_FILE" 2>/dev/null)
  [ -z "$TASK_UUID" ] && exit 0

  # Gather PR details
  UPDATE_NOTES="
---
Completed: $(date '+%Y-%m-%d %H:%M')"

  if [ -n "$PR_NUM" ]; then
    PR_TITLE=$(gh pr view "$PR_NUM" --json title -q '.title' 2>/dev/null || echo "")
    PR_URL=$(gh pr view "$PR_NUM" --json url -q '.url' 2>/dev/null || echo "")
    PR_BODY=$(gh pr view "$PR_NUM" --json body -q '.body' 2>/dev/null || echo "")

    UPDATE_NOTES="${UPDATE_NOTES}
PR: #${PR_NUM} — ${PR_TITLE}
URL: ${PR_URL}"

    if [ -n "$PR_BODY" ]; then
      UPDATE_NOTES="${UPDATE_NOTES}

${PR_BODY}"
    fi
  fi

  # Get existing notes, append update, complete the task
  ARGS=$(jq -n \
    --arg id "$TASK_UUID" \
    --arg notes "$UPDATE_NOTES" \
    '{id: $id, notes: $notes, completed: true}')

  mcp_call "update_todo" "$ARGS" > /dev/null 2>&1

  # Remove from mapping
  jq --arg b "$BRANCH" 'del(.[$b])' "$MAPPING_FILE" > "${MAPPING_FILE}.tmp" \
    && mv "${MAPPING_FILE}.tmp" "$MAPPING_FILE"

  echo "Things3 task completed for branch: ${BRANCH}" >&2
fi

exit 0
