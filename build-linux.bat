@echo off
set CGO_ENABLED=0
set GOOS=linux
set GOARCH=amd64
"C:\Go\bin\go.exe" build -trimpath -ldflags "-s -w -X 'github.com/songquanpeng/one-api/common.Version=v0.0.0'" -o one-api-linux .
echo.
echo Done: one-api-linux
