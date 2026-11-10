@echo off
title OR MasterLab 2.0 Launcher
cd /d "%~dp0"

echo ========================================================
echo       Starting OR MasterLab 2.0 (Operations Research)
echo ========================================================
echo.

taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1

echo [1/2] Starting Node.js Backend Server on http://localhost:3456 ...
start /b node server.js > server.log 2>&1

timeout /t 2 /nobreak >nul

echo [2/2] Starting Cloudflare Public HTTPS Tunnel ...
set CLOUDFLARED_BIN=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe\cloudflared.exe
if exist "%CLOUDFLARED_BIN%" (
    start "Cloudflare Tunnel" "%CLOUDFLARED_BIN%" tunnel --url http://localhost:3456
) else (
    cloudflared tunnel --url http://localhost:3456
)

echo.
echo ========================================================
echo   Platform is running!
echo   Local Address: http://localhost:3456
echo   Check the Cloudflare window for your public HTTPS link!
echo ========================================================
pause
