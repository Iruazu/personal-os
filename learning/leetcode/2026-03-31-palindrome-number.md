# Palindrome Number (Easy)
日付: 2026-03-31
所要時間: 約35分（文字列解25分 + 別解10分）
使用言語: Python

## 問題の要点
整数xが回文かどうかを判定する。負の数はFalse。

## 使用したアルゴリズム・データ構造

### 解法1: 文字列変換
- `str(x)` で文字列化し、`[::-1]` で反転して比較
- `return str(x) == str(x)[::-1]`

### 解法2: 数値のまま反転
- `% 10` で1の位を取り出し、`// 10` で捨てながら反転数を構築
- 負の数は先にFalseを返す（`if x < 0: return False`）

```python
# 解法1
def isPalindrome(self, x):
    return str(x) == str(x)[::-1]

# 解法2
def isPalindrome(self, x):
    original = x
    reversed_num = 0

    if x < 0:
        return False

    while x > 0:
        digit = x % 10
        reversed_num = reversed_num * 10 + digit
        x = x // 10

    return original == reversed_num
```

## 詰まったポイント
- `str(x[::-1])` と `str(x)[::-1]` の違い（変換のタイミング）
- 数値反転で「積み上げ用の変数」と「元の値の保存」が必要と気づくまで時間がかかった
- whileループ内での変数の代入構造が最初つかみにくかった

## 学んだこと
- `s[::-1]` でPythonは文字列を反転できる
- `% 10` と `// 10` の組み合わせで桁を数学的に操作できる
- 解法2は文字列を作らないため空間計算量O(1)で効率が良い
- 負の数の早期リターンを自分で気づいて追加できた

## 次回への改善点
- while条件（`x > 0`）を自力で導けるようにする
- 「変数を使って積み上げる」パターンを他の問題でも使えるか意識する

## 復習予定
- 1週間後: 2026-04-07
- 1ヶ月後: 2026-04-30
