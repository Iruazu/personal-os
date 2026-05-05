# Health App - Tailscale Serve Setup
# このスクリプトはWindowsホスト上のPowerShellで実行してください（WSL内ではありません）
# 前提: Tailscaleインストール済み・ログイン済み

Write-Host "Setting up Tailscale serve for Health App..." -ForegroundColor Green

tailscale serve --bg https:3000 / http://localhost:3000
tailscale serve --bg https:8000 / http://localhost:8000

tailscale serve status

$json = tailscale status --json | ConvertFrom-Json
$domain = $json.Self.DNSName

Write-Host ""
Write-Host "Done! Access URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: https://${domain}:3000" -ForegroundColor Yellow
Write-Host "  Backend:  https://${domain}:8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Update .env:" -ForegroundColor Cyan
Write-Host "  TAILSCALE_DOMAIN=${domain}"
Write-Host "  ALLOWED_ORIGINS=http://localhost:3000,https://${domain}:3000"
Write-Host "  NEXTAUTH_URL=https://${domain}:3000"
