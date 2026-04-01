@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ====================================================
echo               COOTAN Game Host Setup
echo                    by: Will
echo ====================================================
echo.
echo When you continue you will have 2 windows open (this one included). One is the "server" running (window name: GAME SERVER, note this one CANNOT BE CLOSED), and one is this window.
echo.
echo.
echo Likelihood is, you can close this one and the cloudflare windows, but I would not suggest it as I am not sure which part of the spaghetti code will die first.
echo.
echo.
echo Contributers to this codebase: Will Geister, Will Geister, Will Geister
echo.
echo.
choice /C YN /M "Do you wish to run a server (risks to doing so will appear in a EULA I will draft at a later point)"

:: Winget block
where winget >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Winget not detected.
    choice /C YN /M "Do you want to install Winget (required to install Cloudflare)?"
    if ERRORLEVEL 2 (
        echo Winget not installed. Exiting...
        pause
        exit /b 1
    )
    echo Please install Winget manually: https://aka.ms/getwinget
    pause
    exit /b 1
) else (
    echo [OK] Winget is installed.
)

:: Cloudflared block
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Cloudflare Tunnel not found.
    choice /C YN /M "Do you want to install Cloudflare (required to host)?"
    if ERRORLEVEL 2 (
        echo Cloudflare not installed. Exiting...
        pause
        exit /b 1
    )
    echo Installing Cloudflare...
    winget install Cloudflare.cloudflared
    if %ERRORLEVEL% NEQ 0 (
        echo Cloudflare installation failed. Womp Womp. get it yourself, google exists.
        pause
        exit /b 1
    )
    echo [OK] Cloudflare installed.
) else (
    echo [OK] Tunnel found!!.
)

:: .NET backend window
echo Starting Server...
start "GAME SERVER" cmd /k "cd /d %CD% && dotnet run"
timeout /t 3 >nul

echo.
echo -=- HOSTING STARTED SUCCESSFULLY -=-
echo.
echo.
echo You can close this window ONLY or do this VVVV
echo.
echo.
echo.

pause
