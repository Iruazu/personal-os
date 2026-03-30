# personal-os

個人の学習・タスク管理・技術検証の基盤リポジトリ。
AIへの経営マニュアルとして機能する。

## ディレクトリ構成

```
personal-os/
├── config/           # プロフィール・設定
├── goals/            # 目標（人間が管理）
│   ├── vision.md     # 長期目標
│   ├── yearly.md     # 今年の目標
│   └── quarterly.md  # 今期の目標
├── plans/
│   ├── daily/        # 日次プラン（AI生成）YYYY-MM-DD.md
│   └── weekly/       # 週次プラン（AI生成）YYYY-WNN.md
├── learning/         # 学習ログ（AI書き込み）
│   ├── leetcode/     # LeetCode演習ログ
│   ├── english/      # 英語学習ログ
│   └── catchup/      # MLキャッチアップ・技術検証ログ
├── reviews/          # 週次振り返り（AI生成）YYYY-WNN.md
├── decisions/        # 意思決定ログ
└── .claude/
    ├── skills/       # スキル定義
    └── hooks/        # セキュリティフック
```

## スキル一覧

| スキル | 起動フレーズ | 説明 |
|--------|-------------|------|
| `task-manager` | 「今日のタスクを決めたい」 | Linearと連携した日次タスク管理 |
| `learning-coach` | 「LeetCode [問題名]」 | LeetCode演習専属コーチ |
| `sandbox-setup` | 「[技術名]を検証したい」 | Docker検証環境の構築 |

## Linear連携

タスク管理にLinearを使用。MCPで接続済み。
- ワークスペース: Yugodev
- `/mcp` コマンドで接続確認

## セキュリティ

- `.env`, `*.key`, `*.pem`, `*.token`, `settings.local.json` はgit管理外
- PreToolUseフックでシークレットを自動検出・ブロック（`.claude/hooks/detect-secrets.sh`）
- `curl`, `wget`, `.ssh/`, `secrets/` はAIの操作を権限でブロック

## AI運用ルール

詳細は `CLAUDE.md` 参照。
