#!/bin/bash
# シークレットパターン検出
PATTERNS=(
  "sk-ant-"
  "lin_api_"
  "ghp_"
  "AKIA"
  "password\s*="
  "api_key\s*="
  "secret\s*="
)

for pattern in "${PATTERNS[@]}"; do
  if echo "$1" | grep -qi "$pattern"; then
    echo "BLOCKED: シークレットが検出されました: $pattern"
    exit 2
  fi
done
exit 0
