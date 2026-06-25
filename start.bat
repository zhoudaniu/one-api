@echo off
chcp 65001 >nul
echo [One API] 正在启动...

cd /d "%~dp0"

start /B /MIN "" "%~dp0one-api.exe" --log-dir "%~dp0logs"

echo [One API] 已启动，访问 http://localhost:3000
echo [One API] 默认管理员: root / 123456
