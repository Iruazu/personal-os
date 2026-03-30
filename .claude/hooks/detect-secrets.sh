#!/bin/bash
# シークレットパターン検出
# Claude Code は PreToolUse フック入力を stdin に JSON で渡す
PATTERNS=(
  "sk-ant-"
  "lin_api_"
  "ghp_"
  "AKIA"
  "password\s*="
  "api_key\s*="
  "secret\s*="
)

INPUT=$(cat)

for pattern in "${PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qiP "$pattern"; then
    echo "BLOCKED: シークレットが検出されました: $pattern"
    exit 2
  fi
done
exit 0
