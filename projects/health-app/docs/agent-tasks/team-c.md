# Team C — Components (フォーム・テーブル・モーダル)

## 対象ファイル
- `frontend/src/app/workout/page.tsx`
- `frontend/src/app/inbody/page.tsx`
- `frontend/src/app/nutrition/page.tsx`
- `frontend/src/app/english/page.tsx`

## 課題 (Critical)

### 1. Workout の 5 カラムグリッドがモバイルで崩れる
`grid-cols-5` でセット番号・重量・回数・削除ボタンを並べているが 375px では各セルが 50px 未満になり操作不能。

**修正方針:**
```tsx
// 2行レイアウト: 1行目= 種目名(全幅), 2行目= セット/重量/回数/削除
<div className="space-y-2">
  <input placeholder="種目名" className="w-full ..." />
  <div className="grid grid-cols-3 gap-2">
    <input placeholder="セット" ... />
    <input placeholder="重量(kg)" ... />
    <div className="flex gap-1">
      <input placeholder="回数" className="flex-1" ... />
      <button ...>×</button>
    </div>
  </div>
</div>
```

### 2. InBody テーブルの 7 カラムがモバイルで読みにくい
`overflow-x-auto` でスクロール可能だが、モバイルでは横スクロールは UX を損なう。

**修正方針:**
```tsx
{/* モバイル: カードリスト, デスクトップ: テーブル */}
<div className="md:hidden space-y-2">
  {records.map(r => (
    <div className="bg-gray-800 rounded-lg p-3 flex justify-between">
      <div>
        <p className="text-xs text-gray-400">{date}</p>
        <p className="text-sm font-medium">{r.weight_kg}kg / {r.muscle_kg}kg筋肉 / {r.fat_percent}%脂肪</p>
      </div>
      <div className="flex gap-2">...</div>
    </div>
  ))}
</div>
<table className="hidden md:table w-full ...">...</table>
```

### 3. フォームの label 関連付け不足
複数のフォームで `<label>` が `htmlFor` を持たず、対応する `<input>` に `id` がない。

**修正方針:** 全 label/input ペアに htmlFor/id を追加。

### 4. 削除確認の不統一
- Workout セッション削除: 確認なし（即削除）
- InBody レコード削除: `window.confirm` 使用
- Nutrition ログ削除: 確認なし
- English ログ削除: 確認なし

**修正方針:** 軽量なインライン確認 UI を実装（`window.confirm` は廃止）。
例: 削除ボタン押下 → ボタンが「本当に削除？ [はい] [いいえ]」に変化するパターン。

### 5. フォームに loading/error 状態表示が不十分
初回データ取得中に履歴欄が空のまま（ローディング表示なし）。

**修正方針:** `const [fetching, setFetching] = useState(true)` を追加し、スケルトン or スピナーを表示。

## チェックリスト (Reviewer 用)
- [ ] Workout 入力行が 375px で横スクロールなく使える
- [ ] InBody がモバイルでカード表示になっている
- [ ] 全 label に htmlFor、全 input に id がある
- [ ] 削除確認が全ページで統一されている
- [ ] 初回ロード時にスピナー or スケルトンが表示される
- [ ] 型エラーなし
