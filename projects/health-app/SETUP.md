# ヘルストラッキングアプリ セットアップ手順

## 1. 前提条件

以下のソフトウェアがインストール・設定済みであること:

- **Docker Desktop for Windows** (WSL2バックエンドが有効)
  - バージョン 4.x 以上推奨
  - WSL2統合が有効になっていること
- **Tailscale**
  - Windowsホストにインストール・ログイン済み
  - このPCのノード名: `desktop-468burf`
  - iPhoneのノード名: `iphone-se-gen-3`

---

## 2. .envファイルの設定手順

1. `.env.example` をコピーして `.env` を作成する

   ```bash
   cd /home/yugo/dev/personal-os/projects/health-app
   cp .env.example .env
   ```

2. `.env` を編集して各項目を設定する（次のセクションを参照）

3. Tailscaleのドメインを確認する（Windowsのコマンドプロンプトまたはターミナルで実行）

   ```powershell
   tailscale status --json | python -c "import sys,json; d=json.load(sys.stdin); print(d['Self']['DNSName'])"
   ```

   出力例: `desktop-468burf.tail1234.ts.net`

4. 確認したドメインで `.env` を更新する

   ```env
   TAILSCALE_DOMAIN=desktop-468burf.tail1234.ts.net
   ALLOWED_ORIGINS=http://localhost:3000,https://desktop-468burf.tail1234.ts.net:3000
   NEXTAUTH_URL=https://desktop-468burf.tail1234.ts.net:3000
   ```

5. `NEXTAUTH_SECRET` にランダムな文字列を設定する

   ```bash
   openssl rand -base64 32
   ```

   出力をそのまま `NEXTAUTH_SECRET=` に貼り付ける

---

## 3. Google OAuth認証情報の取得手順

1. [Google Cloud Console](https://console.cloud.google.com/) を開く

2. プロジェクトを作成または選択する

3. 左メニューから「APIとサービス」→「認証情報」を選択

4. 「認証情報を作成」→「OAuthクライアントID」をクリック

5. アプリケーションの種類を「ウェブアプリケーション」に設定

6. 承認済みのリダイレクトURIを追加する

   - `http://localhost:3000/api/auth/callback/google`
   - `https://desktop-468burf.your-tailnet.ts.net:3000/api/auth/callback/google`
     （実際のTailscaleドメインに置き換える）

7. 作成後に表示される「クライアントID」と「クライアントシークレット」を `.env` に設定する

   ```env
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
   ```

8. アクセスを許可するGoogleアカウントのメールアドレスを設定する

   ```env
   ALLOWED_EMAIL=your-google-account@gmail.com
   ```

---

## 4. アプリ起動手順

WSL2のターミナルで以下を実行する:

```bash
cd /home/yugo/dev/personal-os/projects/health-app
docker compose up -d
```

起動確認:

```bash
docker compose ps
docker compose logs -f
```

ブラウザで `http://localhost:3000` にアクセスして動作確認する。

停止する場合:

```bash
docker compose down
```

---

## 5. Tailscale HTTPS設定

iPhoneからHTTPS経由でアクセスするためにTailscale Serveを設定する。

**Windowsホストのターミナル（PowerShell）で実行する（WSL内ではない）:**

```powershell
cd C:\path\to\scripts  # 必要であれば
.\scripts\tailscale-serve.ps1
```

または直接実行:

```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl$\Ubuntu\home\yugo\dev\personal-os\projects\health-app\scripts\tailscale-serve.ps1"
```

スクリプトが成功すると以下のURLが表示される:

- Frontend: `https://desktop-468burf.tail1234.ts.net:3000`
- Backend:  `https://desktop-468burf.tail1234.ts.net:8000`

設定をリセットする場合:

```powershell
.\scripts\tailscale-serve-reset.ps1
```

---

## 6. iPhoneからのアクセス方法

前提: iPhoneにTailscaleアプリがインストールされ、同じTailnetにログインしていること。

1. iPhoneでTailscaleアプリを開き、VPN接続を有効にする

2. iPhoneのSafariで以下のURLにアクセスする

   ```
   https://desktop-468burf.tail1234.ts.net:3000
   ```

   （実際のTailscaleドメインに置き換える）

3. Googleアカウントでログインする（`.env`の`ALLOWED_EMAIL`と一致するアカウントを使用）

---

## 7. PWAとしてホーム画面への追加方法（iPhoneのSafari）

iPhoneのSafariでアプリをPWA（Progressive Web App）としてホーム画面に追加できる。

1. iPhoneのSafariでアプリのURLを開く

2. 画面下部の共有ボタン（四角から矢印が出ているアイコン）をタップ

3. 表示されたメニューをスクロールし、「ホーム画面に追加」をタップ

4. アプリ名を確認（必要であれば変更）し、「追加」をタップ

5. ホーム画面にアプリのアイコンが追加される

ホーム画面から起動するとフルスクリーンでアプリが開き、ネイティブアプリに近い操作感になる。

---

## 8. トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認する
docker compose logs backend
docker compose logs frontend

# コンテナを再ビルドする
docker compose down
docker compose up -d --build
```

### CORSエラーが発生する

`.env`の`ALLOWED_ORIGINS`に実際にアクセスしているURLが含まれているか確認する。

```env
ALLOWED_ORIGINS=http://localhost:3000,https://desktop-468burf.tail1234.ts.net:3000
```

変更後はコンテナを再起動する:

```bash
docker compose restart
```

### Google認証でエラーになる

- Google Cloud ConsoleのリダイレクトURIに正しいURLが登録されているか確認する
- `.env`の`NEXTAUTH_URL`がアクセスしているURLと一致しているか確認する
- `ALLOWED_EMAIL`がログインしようとしているGoogleアカウントと一致しているか確認する

### iPhoneからアクセスできない

- iPhoneのTailscaleアプリでVPN接続が有効になっているか確認する
- PC側のTailscale接続状態を確認する（`tailscale status`）
- Tailscale Serveが設定済みか確認する（`tailscale serve status`）
- `scripts/tailscale-serve.ps1`を再実行する

### データが保存されない

`./data`ディレクトリのパーミッションを確認する:

```bash
ls -la /home/yugo/dev/personal-os/projects/health-app/data/
chmod 755 /home/yugo/dev/personal-os/projects/health-app/data/
```
