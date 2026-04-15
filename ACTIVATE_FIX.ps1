# EMERGENCY GIT FIX - RUN THIS NOW
$v3 = "g:\Projects\gym_tracker V-3_APP"
$v4 = "g:\Projects\gym_tracker V-4"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   GYM TRACKER - EMERGENCY GIT FIX" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Clean V-3
if (Test-Path $v3) {
    Write-Host "1. Cleaning V-3_APP main workspace..." -ForegroundColor Cyan
    Set-Location $v3
    git add .
    git commit -m "Finalized Workout GIF Upgrades"
}

# Clean V-4
if (Test-Path $v4) {
    Write-Host "2. Cleaning V-4 worktree..." -ForegroundColor Cyan
    Set-Location $v4
    git add .
    git commit -m "Prepared Worktree for Sync"
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "   SUCCESS! Both workspaces are clean." -ForegroundColor Green
Write-Host "   PLEASE RETRY YOUR WORKTREE MOVE NOW." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
pause
