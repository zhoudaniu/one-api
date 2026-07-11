@echo off
set GOOS=linux
set GOARCH=amd64
set CGO_ENABLED=0
go build -trimpath -ldflags="-s -w" -o one-api.exe .
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)
echo Build successful: one-api.exe
