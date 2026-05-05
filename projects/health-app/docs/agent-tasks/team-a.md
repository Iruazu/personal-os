# Team A — Foundation (レイアウト基盤・ブレークポイント)

## 対象ファイル
- `frontend/src/app/layout.tsx`
- `frontend/tailwind.config.ts`
- `frontend/src/app/globals.css`
- 全ページの `p-4 pb-24` → `main` との二重 padding 修正

## 課題 (Critical)

### 1. 二重 padding
`layout.tsx` の `<main>` が `px-4 py-8` を持ち、各ページも `p-4` を重ねている。
実質 `px-8` 相当になりモバイルでスペースが無駄になる。

**修正方針:**
- `<main>` の padding を `px-0 py-0` に変更（または削除）
- 各ページの `p-4 pb-24` はそのまま残す（ページが自身の padding を持つ）

### 2. `pb-24` がデスクトップでも効く
BottomNav は `md:hidden` だが、`pb-24` はデスクトップでも大きな空白を作る。

**修正方針:** 各ページの `pb-24` → `pb-24 md:pb-8` に変更

### 3. Tailwind デザイントークン未定義
`tailwind.config.ts` の `theme.extend` が空。色・スペーシングが全ファイルにハードコード。

**修正方針:**
```ts
theme: {
  extend: {
    colors: {
      surface: {
        base: '#030712',   // bg-gray-950
        card: '#111827',   // bg-gray-900
        input: '#1f2937',  // bg-gray-800
        border: '#374151', // gray-700
      },
    },
  },
},
```
※ まず追加のみ。既存クラスの一括置換は Team D スコープ。

### 4. gray / slate 混在
`layout.tsx` は `bg-gray-950`、`login/page.tsx` は `bg-slate-950`、`BottomNav` は `bg-slate-900`。

**修正方針:** layout.tsx と BottomNav を `slate` に統一（またはその逆）— Team D と調整。

## チェックリスト (Reviewer 用)
- [ ] `npm run build` 成功
- [ ] `npm run type-check` 成功
- [ ] 375px でページに横スクロールが発生しない
- [ ] 1280px で過剰な余白がない
- [ ] デスクトップで BottomNav 分の空白がなくなった
