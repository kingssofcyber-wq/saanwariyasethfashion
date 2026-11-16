@echo off
setlocal
cd /d "%~dp0"
title Saanwariya Seth Fashion - Database and Admin Setup
if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example.
  echo IMPORTANT: Add DATABASE_URL, AUTH_SECRET and a private ADMIN_PASSWORD.
  notepad .env
  echo Save and close Notepad after updating the values.
  pause
)
echo.
echo [1/3] Installing packages...
call npm install
if errorlevel 1 goto failed
echo.
echo [2/3] Creating/updating all Prisma database tables, admin user and demo products...
call npm run db:setup
if errorlevel 1 goto failed
echo.
echo [3/3] Starting the website...
call npm run dev
goto end
:failed
echo.
echo Setup stopped. Check DATABASE_URL, ADMIN_PASSWORD and the command output.
pause
:end
endlocal
