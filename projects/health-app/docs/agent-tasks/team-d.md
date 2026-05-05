# Team D — Visual Polish (タイポグラフィ・スペーシング・カラー)

## 対象ファイル
- `frontend/tailwind.config.ts`
- `frontend/src/app/globals.css`
- `frontend/src/app/page.tsx`（Home カード）
- 各ページの色・スペーシングクラス統一

## 課題 (High)

### 1. gray / slate パレット混在
現状:
- `layout.tsx`: `bg-gray-950`, `bg-gray-900`, `bg-gray-800`
- `login/page.tsx`: `bg-slate-950`, `bg-slate-900`, `border-slate-700`
- `BottomNav.tsx`: `bg-slate-900`, `border-slate-700`, `text-slate-400`
- `UserMenu.tsx`: `text-slate-400`, `border-slate-700`

Tailwind の `gray` と `slate` は微妙に異なる色味。統一が必要。

**修正方針:** `slate` に統一（login は既に slate なので他を slate に合わせる）。
- `bg-gray-950` → `bg-slate-950`
- `bg-gray-900` → `bg-slate-900`
- `bg-gray-800` → `bg-slate-800`
- `border-gray-700` → `border-slate-700`
- `text-gray-400` → `text-slate-400`
- `stroke="#374151"` (gray-700) → `stroke="#334155"` (slate-700) ※ Recharts インライン style

※ Team A が Tailwind トークンを追加した後に作業。調整して衝突を避けること。

### 2. Home カードの `hover:scale-105` → CLS 発生
スケールトランスフォームはレイアウトシフトを引き起こす。

**修正方針:**
```tsx
// before
className={`... hover:scale-105 transition-transform ...`}

// after
className={`... hover:brightness-110 hover:shadow-lg transition-all duration-200 ...`}
```

### 3. フォーカスリングの欠如
大部分の `<button>` にフォーカス時のスタイルがない。キーボード操作ユーザーが現在地を見失う。

**修正方針:** `globals.css` にグローバルフォーカスリングを追加:
```css
@layer base {
  :focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
}
```
`focus:outline-none` が残っているコンポーネント（InBody EditModal の input）は `focus:ring-1 focus:ring-blue-500` を残す。

### 4. フォームの input スタイル不統一
- 一部は `rounded`（4px）
- 他は `rounded-xl`（12px）
- モーダル内は `rounded` + `focus:ring-1` あり
- 他は focus ring なし

**修正方針:** globals.css に `@layer components` で共通クラス定義:
```css
@layer components {
  .input-base {
    @apply bg-slate-800 rounded-lg px-3 py-2 text-base w-full
           focus:outline-none focus:ring-2 focus:ring-blue-500/50
           transition-shadow;
  }
}
```

## チェックリスト (Reviewer 用)
- [ ] gray/slate が全ページで統一されている
- [ ] Home カードでスケールアニメーションが発生しない
- [ ] 全インタラクティブ要素にフォーカスリングが見える
- [ ] フォームの input スタイルが統一されている
- [ ] `prefers-reduced-motion` 時にトランジションが無効化される（globals.css に追加）
- [ ] コントラスト比: テキスト vs 背景が 4.5:1 以上（WCAG AA）
