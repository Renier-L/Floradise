@echo off
title Floradise — Vulnerable Mode (For Attack Testing)
cd /d "%~dp0"
echo ===================================================================
echo   FLORADISE — VULNERABLE MODE (DEFENSE DISABLED)
echo ===================================================================
echo.
python defense_server.py --vulnerable
pause
