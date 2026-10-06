@echo off
title FloraBloom Cybersecurity Lab Launcher
echo ===================================================================
echo   FloraBloom — Intentionally Vulnerable Flower Shop Security Lab
echo ===================================================================
echo Starting local web server on http://localhost:8000 ...
echo Press Ctrl+C in this window to stop the server.
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Python detected. Launching HTTP server...
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

where py >nul 2>nul
if %errorlevel% equ 0 (
    echo Python launcher detected. Launching HTTP server...
    start http://localhost:8000
    py -m http.server 8000
    goto end
)

where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo Node.js npx detected. Launching serve...
    start http://localhost:8000
    npx serve -l 8000
    goto end
)

echo Neither Python nor Node.js detected.
echo Opening index.html directly in your default browser...
start index.html

:end
pause
