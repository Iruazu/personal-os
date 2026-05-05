# Team E — A11y & Performance (アクセシビリティ・パフォーマンス)

## 対象ファイル
- `frontend/src/app/inbody/page.tsx`（EditModal）
- `frontend/src/components/AuthSync.tsx`
- `frontend/src/middleware.ts`
- 全ページの ARIA 属性

## 課題 (High)

### 1. EditModal に ARIA 属性がない
`EditModal` はモーダルダイアログだが ARIA ロールが未設定。スクリーンリーダーに「ダイアログが開いた」と伝わらない。フォーカスも管理されていない。

**修正方針:**
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  className="fixed inset-0 z-50 ..."
>
  <div ...>
    <h3 id="modal-title" ...>手動修正</h3>
    {/* autoFocus を最初の input に付与 */}
    {/* Escape キーで閉じる: useEffect でキーイベント */}
    {/* フォーカストラップ: Tab キーがモーダル内に留まる */}
  </div>
</div>
```

フォーカストラップの実装:
```tsx
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [onClose]);
```

### 2. ファイルアップロードボタンの a11y
InBody の `<label>` がボタンに擬装されているが、`role` がない。ローディング中の状態変化が screen reader に伝わらない。

**修正方針:**
```tsx
<label
  role="button"
  aria-busy={uploading}
  aria-label={uploading ? "OCR処理中" : "InBody画像を選択してアップロード"}
  ...
>
```

### 3. 削除ボタンの `aria-label` 不足
`<button>削除</button>` だけでは「何を削除するか」が不明（スクリーンリーダーで複数ある場合に区別できない）。

**修正方針:**
```tsx
<button aria-label={`${formatDate(s.date)}のセッションを削除`} ...>削除</button>
```

### 4. `prefers-reduced-motion` 未対応
Team D が追加する CSS に追記（調整）:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5. Recharts グラフの代替テキスト
チャートは `<svg>` で描画されるがスクリーンリーダーには意味不明。

**修正方針:** チャートの `<div>` wrapper に `role="img"` と `aria-label` を追加:
```tsx
<div role="img" aria-label="体重・筋肉量・体脂肪量の推移グラフ">
  <ResponsiveContainer ...>
```

### 6. パフォーマンス: `recharts` のツリーシェイキング
現在 `recharts` 全体を import。必要なコンポーネントのみ named import している ✓（現状 OK）。

### 7. Google SVG アイコンの a11y
Login ページの Google ロゴ SVG に `aria-hidden="true"` がない。

**修正方針:**
```tsx
<svg aria-hidden="true" focusable="false" ...>
```

## チェックリスト (Reviewer 用)
- [ ] EditModal で `role="dialog" aria-modal="true"` が設定されている
- [ ] EditModal が Escape キーで閉じる
- [ ] EditModal 内でフォーカスが外に出ない（Tab で循環）
- [ ] 削除ボタンに文脈のある aria-label がある
- [ ] チャートに role="img" aria-label がある
- [ ] Google SVG に aria-hidden がある
- [ ] `prefers-reduced-motion` でモーションが抑制される
- [ ] アップロードボタンに aria-busy が設定される
