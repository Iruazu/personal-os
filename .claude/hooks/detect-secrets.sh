#!/bin/bash
# シークレットパターン検出
# 空値・変数参照・プレースホルダーは許可し、実際の値を持つ場合のみブロック

PATTERNS=(
  "sk-ant-[a-zA-Z0-9]"
  "lin_api_[a-zA-Z0-9]"
  "ghp_[a-zA-Z0-9]"
  "AKIA[A-Z0-9]"
)

# 20文字以上の英数字が続く場合のみ実際の値とみなしてブロック
VALUE_PATTERNS=(
  "password\s*=\s*[a-zA-Z0-9+/!@#]{8,}"
  "api_key\s*=\s*[a-zA-Z0-9+/]{20,}"
)

INPUT=$(cat)

for pattern in "${PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qiP "$pattern"; then
    echo "BLOCKED: シークレットが検出されました: $pattern"
    exit 2
  fi
done

for pattern in "${VALUE_PATTERNS[@]}"; do
  if echo "$INPUT" | grep -qiP "$pattern"; then
    echo "BLOCKED: シークレットが検出されました（実際の値）: $pattern"
    exit 2
  fi
done

exit 0
