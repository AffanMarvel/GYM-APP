@echo off
echo ========================================
echo   BEAST MODE - GIT AUTO-FIX
echo ========================================
echo.
echo 1. Staging your new features (Admin Panel, UI, etc.)...
git add .
echo.
echo 2. Committing changes to your workspace...
git commit -m "Finalize Beast Mode Admin Panel and Android UI Fixes"
echo.
echo ========================================
echo   SUCCESS! Your workspace is now clean.
echo   You can now retry your worktree checkout.
echo ========================================
pause
