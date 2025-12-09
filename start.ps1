# Financial Card Storm 실행 스크립트
# PowerShell 스크립트

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Financial Card Storm v3.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 기존 Node 프로세스 종료
Write-Host "[1/3] 기존 프로세스 정리 중..." -ForegroundColor Yellow
taskkill /IM node.exe /F 2>$null
Start-Sleep -Seconds 1

# 2. 게임 실행
Write-Host "[2/3] 게임 서버 시작 중..." -ForegroundColor Yellow
Write-Host ""
Write-Host "프론트엔드: http://localhost:5173" -ForegroundColor Green
Write-Host "백엔드: http://localhost:3002" -ForegroundColor Green
Write-Host ""

# 3. npm run dev:full 실행
Write-Host "[3/3] 실행 중..." -ForegroundColor Yellow
Write-Host ""
Write-Host "브라우저에서 http://localhost:5173 를 열어주세요!" -ForegroundColor Cyan
Write-Host "Guest로 시작하거나 로그인하세요!" -ForegroundColor Cyan
Write-Host ""

npm run dev:full





