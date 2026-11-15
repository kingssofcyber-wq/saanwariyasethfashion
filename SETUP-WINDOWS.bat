@echo off
setlocal
cd /d "%~dp0"
title Saanwariya Seth Fashion - Setup
if not exist .env (
  copy .env.example .env >nul
  echo Created .env from .env.example.
  echo IMPORTANT: Edit .env and add your Hostinger/MySQL database details and your own admin password.
  notepad .env
  echo Save and close Notepad after updating the values.
  pause
)
echo.
echo [1/4] Installing packages...
call npm install
if errorlevel 1 goto failed
echo.
echo [2/4] Generating database tables...
call npx prisma db push
if errorlevel 1 goto failed
echo.
echo [3/4] Adding administrator and 30 demo products...
call npm run db:seed
if errorlevel 1 goto failed
echo.
echo [4/4] Starting the website...
call npm run dev
goto end
:failed
echo.
echo Setup stopped because a command failed. Check your .env database values and terminal error.
pause
:end
endlocal
