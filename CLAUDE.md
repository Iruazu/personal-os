# Personal OS - Claude Manual

## Repository Purpose
このリポジトリは個人の学習・タスク管理・技術検証の基盤。
AIへの経営マニュアルとして機能する。

## Profile
@config/profile.md

## Directory Structure
- goals/            : 目標（人間が管理）
- plans/daily/      : 日次プラン（AI生成）YYYY-MM-DD.md形式
- plans/weekly/     : 週次プラン（AI生成）YYYY-WNN.md形式
- learning/leetcode/: LeetCode演習ログ（AI書き込み）
- learning/english/ : 英語学習ログ（AI書き込み）
- learning/catchup/ : MLキャッチアップ・技術検証ログ（AI書き込み）
- reviews/          : 週次振り返り（AI生成）YYYY-WNN.md形式、毎週日曜
- decisions/        : 意思決定ログ（背景・選択肢・結論を記録）
- .claude/skills/   : スキル定義

## Core Rules
1. ログはlearning/配下の該当サブディレクトリに書き込む
   - LeetCode: learning/leetcode/
   - 英語: learning/english/
   - MLキャッチアップ・技術検証: learning/catchup/
2. 日次プランはplans/daily/YYYY-MM-DD.mdに生成する
3. 回答は日本語。コードはそのまま
4. 推測と事実は明確に分ける
5. 200行を超えるファイルは分割する

## Skills
- learning-coach : 学習専属コーチ（LeetCode演習）
- task-manager   : Linearと連携した日次タスク管理
- sandbox-setup  : Docker技術検証環境構築

## Working Style
- 長いセッションでは/compactを積極的に使う
- 複数ファイル編集時はplanを先に提示してから実行
- goals/quarterly.mdを参照してからタスク提案・プラン生成を行う
- Linearへの書き込みは必ずユーザーの合意後に実行する
