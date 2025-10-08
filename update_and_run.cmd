@echo off
echo ========================================
echo BMS Monitoring - Install and Run
echo ========================================
echo.

echo [1/2] Installing dependencies...
echo This may take a few minutes...
echo.
call npm install

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm install failed!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting the application...
echo.
call npm start

pause
