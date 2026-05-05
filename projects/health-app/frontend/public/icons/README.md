# PWAアイコンの追加方法

このディレクトリには以下のアイコンファイルが必要です。

## 必要なファイル

| ファイル名 | サイズ | 用途 |
|-----------|--------|------|
| `icon-192.png` | 192×192px | ホーム画面アイコン（標準） |
| `icon-512.png` | 512×512px | ホーム画面アイコン（高解像度） |

## 作成方法

### オプション1: RealFaviconGenerator（推奨）
1. https://realfavicongenerator.net にアクセス
2. 元画像（512px以上の正方形PNG）をアップロード
3. PWA向けアイコンをダウンロード
4. `icon-192.png` と `icon-512.png` をこのディレクトリに配置

### オプション2: Canva
1. https://www.canva.com でデザインを作成
2. 512×512px でエクスポート
3. macOS/Linux の `convert`（ImageMagick）でリサイズ:
   ```bash
   convert icon-512.png -resize 192x192 icon-192.png
   ```

### オプション3: PWABuilder
1. https://www.pwabuilder.com にアクセス
2. アイコン生成ツールを使用

## 注意事項

- `purpose: "any maskable"` を指定しているため、マスカブルアイコンとして
  使用されます。重要なデザイン要素は中央の約80%（セーフゾーン）に収めてください。
- アイコンなしでもPWA自体は動作しますが、ホーム画面に追加した際に
  デフォルトアイコンが表示されます。
