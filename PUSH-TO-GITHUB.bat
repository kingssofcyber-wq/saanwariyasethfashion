@echo off
setlocal
cd /d "%~dp0"

set "REPO_URL=https://github.com/kingssofcyber-wq/saanwariyasethfashion.git"

echo.
echo ================================================
echo   Saanwariya Seth Fashion - GitHub Push Helper
echo ================================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo ERROR: Git is not installed or is not available in PATH.
  echo Install Git for Windows, reopen this window, and run this file again.
  pause
  exit /b 1
)

if not exist ".git" (
  echo Initializing local Git repository...
  git init
  if errorlevel 1 goto :failed
)

git branch -M main
if errorlevel 1 goto :failed

git remote get-url origin >nul 2>&1
if errorlevel 1 (
  git remote add origin "%REPO_URL%"
) else (
  git remote set-url origin "%REPO_URL%"
)
if errorlevel 1 goto :failed

rem Ensure common local secret files are never uploaded.
git rm --cached --ignore-unmatch .env .env.local .env.production .env.development.local >nul 2>&1

git add -A
if errorlevel 1 goto :failed

git diff --cached --quiet
if not errorlevel 1 (
  echo No new file changes are staged. Trying to push the current main branch...
) else (
  git commit -m "Deploy Saanwariya Seth Fashion website"
  if errorlevel 1 goto :failed
)

echo.
echo Pushing main branch to GitHub...
git push -u origin main
if errorlevel 1 goto :failed

echo.
echo SUCCESS: Code pushed to:
echo %REPO_URL%
echo.
echo Next: connect this repository in Hostinger hPanel as a Next.js Web App.
pause
exit /b 0

:failed
echo.
echo The push did not complete. Read the Git error above.
echo Common causes: GitHub sign-in is needed, network issue, or remote branch conflict.
echo Do not paste passwords or access tokens into chat.
pause
exit /b 1
