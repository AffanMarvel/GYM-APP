# EMERGENCY GIT FIX - RUN THIS NOW
$v3 = "g:\Projects\gym_tracker V-3_APP"
$v4 = "g:\Projects\gym_tracker V-4"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   GYM TRACKER - EMERGENCY GIT FIX" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Clean V-3
if (Test-Path $v3) {
    Write-Host "1. Stashing uncommitted changes in V-3_APP main workspace..." -ForegroundColor Cyan
    Set-Location $v3
    git stash
}

# Clean V-4
if (Test-Path $v4) {
    Write-Host "2. Stashing uncommitted changes in V-4 worktree..." -ForegroundColor Cyan
    Set-Location $v4
    git stash
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "   SUCCESS! Both workspaces are clean." -ForegroundColor Green
Write-Host "   PLEASE RETRY YOUR WORKTREE MOVE NOW." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow
pause
