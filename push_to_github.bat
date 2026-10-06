@echo off
title Push FloraBloom to GitHub
cd /d "%~dp0"
echo ===================================================================
echo   Pushing FloraBloom to https://github.com/Renier-L/Floradise.git
echo ===================================================================
echo.

set "GIT_PATH=%LOCALAPPDATA%\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"
if not exist "%GIT_PATH%" (
    for /f "delims=" %%i in ('where git 2^>nul') do set "GIT_PATH=%%i"
)

echo Running: git push -u origin main ...
echo.
"%GIT_PATH%" push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ===================================================================
    echo   SUCCESS! Files successfully pushed to GitHub!
    echo   Refresh your browser at: https://github.com/Renier-L/Floradise
    echo ===================================================================
) else (
    echo ===================================================================
    echo   If prompted, sign in via browser to authorize GitHub.
    echo ===================================================================
)
pause
