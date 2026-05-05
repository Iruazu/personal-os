# UI/UX Improvement Report

## 変更点サマリ

### Team A — Foundation (tailwind.config.ts)
- `theme.extend.colors` に `surface.*` デザイントークン追加
  - `surface.base` (#020617 = slate-950)
  - `surface.card` (#0f172a = slate-900)
  - `surface.input` (#1e293b = slate-800)
  - `surface.border` (#334155 = slate-700)

### Team B — Navigation (構造変更)
- **Route Groups 導入**: `(auth)/login` と `(app)/*` に分離
  - `/login` でトップナビが表示されなくなった
- **Root layout.tsx** を最小化 (Providers + SW + AuthSync のみ)
- **`(app)/layout.tsx`** 新設: デスクトップ用トップナビ (`hidden md:flex`) + `<main>` + `<BottomNav>`
  - `viewport` に `width: "device-width", initialScale: 1` を明示
- **アクティブ状態**: トップナビ・BottomNav 両方に現在地ハイライト追加
- **BottomNav**: デフォルトエクスポートから名前付きエクスポートに変更、ホームタブ追加 (5 タブ構成)
  - `aria-label="メインナビゲーション"`, `aria-current="page"` 追加
  - タップ領域 `min-h-[52px]` に拡大
- **モバイルでトップナビを非表示** (`hidden md:flex`): BottomNav に一本化

### Team C — Components (workout / nutrition / english)
- **Workout 入力行**: `grid-cols-5` → 2 行レイアウト (種目名全幅 + `grid-cols-3` でセット/重量/回数)
- **削除確認**: 3 ページ全てでインライン確認 UI 実装（「削除しますか？はい / いいえ」）
  - `window.confirm` 廃止、`pendingDelete` state で管理
- **ローディング表示**: 初回データ取得中にスピナー表示
- **外側余白除去**: 各ページの `p-4 pb-24` 削除 (`(app)/layout.tsx` の `<main>` で管理)

### Team D — Visual Polish (globals.css / home page)
- **フォーカスリング**: `:focus-visible` グローバルスタイル追加 (2px solid #3b82f6)
- **input 共通スタイル**: `@layer base` で `input`, `select`, `textarea` の統一スタイル
- **`prefers-reduced-motion`**: アニメーション・トランジション抑制
- **Home カード**: `hover:scale-105` → `hover:brightness-110 hover:shadow-xl` (CLS 解消)
- **外側余白除去**: Home ページの `p-4 pb-24` 削除

### Team E — A11y & Performance (inbody page)
- **モバイルカード表示**: `md:hidden` カードリスト + `hidden md:block` テーブルの2モード
- **EditModal ARIA**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"` 追加
- **フォーカス管理**: Escape キーでモーダルを閉じる、初期フォーカスを最初の入力に
- **スクロールロック**: モーダル表示中 `document.body.style.overflow = "hidden"`
- **削除確認**: `window.confirm` → インライン確認 UI
- **ローディング表示**: スピナー追加
- **アップロードボタン**: `role="button"`, `aria-busy`, `aria-label` 追加
- **削除ボタン**: `aria-label` に日付情報を含める

---

## Build 結果

```
✓ Compiled successfully
✓ Type checking passed
✓ 9 pages generated

Route (app)           Size     First Load JS
/ (Home)              340 B    147 kB
/english              10.5 kB  263 kB
/inbody               4.26 kB  261 kB
/login                1.17 kB  155 kB
/nutrition            2.77 kB  156 kB
/workout              3.36 kB  260 kB
```

---

## 修正前後の主な差分

| 項目 | Before | After |
|------|--------|-------|
| `/login` のナビ | 表示される | 非表示 (Route Groups) |
| モバイルナビ | トップナビのみ (溢れる) | BottomNav のみ (5タブ) |
| アクティブ状態 | なし | トップ・BottomNav 両方 |
| Workout 入力 | 5列 (375px で崩れ) | 2行3列 (正常) |
| InBody テーブル | 全サイズで横スクロール | モバイル: カード / デスクトップ: テーブル |
| 削除確認 | 各ページで不統一 | 全ページインライン確認統一 |
| ローディング | 表示なし | スピナー表示 |
| EditModal ARIA | なし | role/aria-modal/aria-labelledby/Escape |
| フォーカスリング | ほぼなし | :focus-visible グローバル適用 |
| hover:scale | CLS 発生 | brightness + shadow に変更 |
| 余白管理 | 各ページ + layout の二重 | layout の main のみ |
| SW キャッシュ | v3 | v4 (チャンクハッシュ更新対応) |

---

## 残課題と推奨フォローアップ

1. **フォーカストラップ (Tab キー循環)**: EditModal は Escape 対応済みだが、Tab キーがモーダル外に出る問題は未対応。`focus-trap-react` ライブラリ導入を推奨。
2. **gray/slate 混在**: globals.css と layout では slate に統一済みだが、各ページ内の Recharts `stroke` カラー (`#374151` = gray-700) は未変更。
3. **チャートの a11y**: `role="img"` + `aria-label` の追加が未実施 (Team E スコープ外だった)。
4. **Google SVG の `aria-hidden`**: ログインページの Google ロゴ SVG に `aria-hidden="true"` が未追加。
5. **デザイントークンの活用**: Team A が追加した `surface.*` トークンはまだ各ページで使われていない。段階的に `bg-gray-900` → `bg-surface-card` などに移行推奨。
6. **テスト**: 現状テストファイルなし。主要フォームのユニットテストと E2E テストの追加を推奨。

---

## 既知の制約・注意事項

- **スマホ再認証**: `auth.ts` の Google トークン自動更新対応 (本セッションの別タスク) により、既存セッションユーザーは初回に再サインインが必要。
- **SW キャッシュ**: v4 にバンプ済み。次回ビルド時も `public/sw.js` の `CACHE_NAME` をインクリメントすること。
- **Route Groups の移行**: ファイル移動を伴うため、他ブランチと同時作業している場合はマージコンフリクトに注意。
