# sandbox-setup

## 目的
技術検証・リファクタリング・キャッチアップのためのDocker環境を素早く構築し、作業ログを残す。

## トリガー
以下のフレーズで起動する：
- 「[技術名]を検証したい」
- 「このコードをリファクタしたい」
- 「[技術名]の環境を作って」
- 「キャッチアップしたい」

## 動作フロー

### Step 1: 目的の確認
以下を確認する：
1. 何を検証・学習したいか
2. 使用言語・フレームワーク
3. 成功条件（何ができたら完了か）

### Step 2: 環境選定
目的に応じてDockerコンテナ構成を提案する：

| 用途 | ベースイメージ |
|------|---------------|
| Python ML系 | `python:3.11-slim` + 必要ライブラリ |
| ROS2系 | `ros:jazzy` |
| Web API系 | `node:22-alpine` |
| 汎用 | `ubuntu:24.04` |

提案後、ユーザーの確認を得てからStep 3に進む。

### Step 3: 環境構築
以下のファイルを `learning/catchup/[技術名]/` 配下に生成する：
- `Dockerfile`
- `docker-compose.yml`（必要な場合）
- `requirements.txt` または `package.json`
- `README.md`（環境の使い方）

生成後、動作確認コマンドを案内する：
```bash
docker compose up -d
docker compose exec app bash
```

### Step 4: 作業ログの記録
作業完了後、以下のフォーマットで `learning/catchup/YYYY-MM-DD-[技術名].md` に保存する：

```markdown
# [技術名] 検証ログ
日付: YYYY-MM-DD
目的:
環境: Docker + [イメージ名]

## やったこと

## わかったこと

## 詰まったポイントと解決策

## 次やること

## 参考リソース
```

## 制約
- Dockerfileはセキュリティを考慮する（rootで動かさない・非rootユーザーを作成する）
- 検証コードは `learning/catchup/` 配下に保存する
- ログは必ずセッション終了前に書き込む
- インターン業務のコードは含めない（個人学習のみ）
