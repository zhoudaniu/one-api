@echo off
chcp 65001 >nul
title One API Deploy - web-api

cd /d "%~dp0"

echo =====================================
echo   One API Deploy - web-api
echo   Server: 47.236.116.227
echo =====================================
echo.

echo [1/4] Building frontend (web-api)...
cd web\web-api && call npm run build && cd /d "%~dp0"
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Build error
    pause
    exit /b 1
)
echo [OK]
echo.

echo [2/4] Cross-compiling for Linux...
set CGO_ENABLED=0
set GOOS=linux
set GOARCH=amd64
"C:\Go\bin\go.exe" build -trimpath -ldflags "-s -w -X 'github.com/songquanpeng/one-api/common.Version=v0.0.0'" -o one-api-linux .
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Compilation error
    pause
    exit /b 1
)
echo [OK] one-api-linux
echo.

echo [3/4] Uploading to server...
scp -o StrictHostKeyChecking=accept-new one-api-linux root@47.236.116.227:/root/
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Upload error
    pause
    exit /b 1
)
echo [OK]
echo.

echo [4/4] Deploying on server...
ssh -o StrictHostKeyChecking=accept-new root@47.236.116.227 "docker cp /root/one-api-linux one-api:/one-api-new && docker exec -i one-api sh -c 'mv /one-api /one-api.old && mv /one-api-new /one-api && chmod +x /one-api' && docker restart one-api"
if %ERRORLEVEL% NEQ 0 (
    echo [FAILED] Deploy error
    pause
    exit /b 1
)
echo [OK]
echo.

echo =====================================
echo   Deploy complete!
echo   http://47.236.116.227:3000
echo =====================================
pause
