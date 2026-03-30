# Personal OS - Claude Manual

## Repository Purpose
このリポジトリは個人の学習・タスク管理・技術検証の基盤。
AIへの経営マニュアルとして機能する。

## Profile
@config/profile.md

## Directory Structure
- goals/          : 目標（人間が管理）
- plans/daily/    : 日次プラン（AI生成）YYYY-MM-DD.md形式
- learning/       : 学習ログ（AI書き込み）
- reviews/        : 振り返り（AI生成）
- decisions/      : 意思決定ログ
- .claude/skills/ : スキル定義

## Core Rules
1. ログは必ずlearning/配下の該当ディレクトリに書き込む
2. 日次プランはplans/daily/YYYY-MM-DD.mdに生成する
3. 回答は日本語。コードはそのまま
4. 推測と事実は明確に分ける
5. 200行を超えるファイルは分割する

## Skills
- daily-planner  : 朝のルーティン・タスク提案
- learning-coach : 学習専属コーチ
- task-manager   : タスク管理
- sandbox-setup  : 技術検証環境構築

## Working Style
- 長いセッションでは/compactを積極的に使う
- 複数ファイル編集時はplanを先に提示してから実行
