@echo off
setlocal
cd /d "%~dp0"
title Push HotelPro to GitHub

echo ==============================================================================
echo  HotelPro - Push to GitHub Repository
echo  Target: https://github.com/Harsh-Singh3022/HOTEL-PRO-PROJECT.git
echo ==============================================================================
echo.

set "PATH=%LOCALAPPDATA%\Programs\MinGit\cmd;%PATH%"

echo Checking Git status...
git status -s
echo.

echo Pushing main branch to origin...
echo (If prompted, log in with your GitHub account in the browser or paste your Personal Access Token)
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================================================
    echo  SUCCESS: HotelPro uploaded to GitHub successfully!
    echo  Repository: https://github.com/Harsh-Singh3022/HOTEL-PRO-PROJECT
    echo ==============================================================================
) else (
    echo.
    echo ==============================================================================
    echo  Push failed or requires authorization.
    echo  Tip: You can push with a GitHub Personal Access Token (PAT) with:
    echo    git push https://^<YOUR_TOKEN^>@github.com/Harsh-Singh3022/HOTEL-PRO-PROJECT.git main
    echo ==============================================================================
)

echo.
pause
