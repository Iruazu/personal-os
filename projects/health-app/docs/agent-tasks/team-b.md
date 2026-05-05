# Team B — Navigation (ヘッダー・BottomNav)

## 対象ファイル
- `frontend/src/app/layout.tsx` (top nav)
- `frontend/src/components/BottomNav.tsx`
- `frontend/src/components/UserMenu.tsx`

## 課題 (Critical)

### 1. ログインページにトップナビが表示される
`layout.tsx` が全ルートを包むため `/login` でもナビが表示される。
ログインページは独立した全画面レイアウトにすべき。

**修正方針:**
`/login` では `<nav>` を非表示にする。方法の選択肢:
- (a) `usePathname()` で `/login` の時は `null` を返す Client Component にラップ
- (b) Route Groups: `(app)/layout.tsx` にナビを移動し、`(auth)/login/page.tsx` を分離
- **推奨: (b)** — Next.js App Router の設計に合致

ディレクトリ構造:
```
src/app/
  (auth)/
    login/
      page.tsx  ← 現在の login/page.tsx をそのまま移動
  (app)/
    layout.tsx  ← <nav> + <main> + <BottomNav> を含む
    page.tsx
    workout/page.tsx
    inbody/page.tsx
    nutrition/page.tsx
    english/page.tsx
```
ルート `layout.tsx` は `<html><body>` + `<Providers>` + `<ServiceWorkerRegistration>` + `<AuthSync>` のみ。

### 2. トップナビにアクティブ状態がない
現在全リンクが同じスタイル。

**修正方針:**
```tsx
'use client';
import { usePathname } from 'next/navigation';
// pathname === href で text-white, border-b-2 border-blue-500 等を付与
```

### 3. モバイルでトップナビが溢れる
375px で Home/筋トレ/InBody/栄養/英語 + UserMenu の 6 要素が `gap-6` で並ぶ → オーバーフロー。

**修正方針:**
- トップナビはデスクトップ専用 (`hidden md:flex`) に変更
- モバイルは BottomNav で完結させる
- Home へのリンクを BottomNav に追加（5タブ構成に）

### 4. BottomNav に Home がない
BottomNav の TABS は 4 項目のみ。

**修正方針:**
```tsx
const TABS = [
  { href: '/',         label: 'ホーム',  icon: '🏠' },
  { href: '/workout',  label: '筋トレ',  icon: '🏋️' },
  { href: '/inbody',   label: 'InBody',  icon: '⚖️' },
  { href: '/nutrition',label: '栄養',    icon: '🥗' },
  { href: '/english',  label: '英語',    icon: '📚' },
];
```
5タブになるので各アイテムの `min-h-[48px]` と幅を確認。

## チェックリスト (Reviewer 用)
- [ ] `/login` でナビが表示されない
- [ ] 全ページでアクティブタブがハイライトされる
- [ ] 375px でトップナビが横スクロールしない
- [ ] BottomNav に Home が含まれる
- [ ] BottomNav の全タブが 44px 以上のタップ領域を持つ
- [ ] ミドルウェアのリダイレクト先が新しい Route Group パスと一致する
