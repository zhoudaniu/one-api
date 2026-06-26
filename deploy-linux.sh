#!/bin/bash
set -e
echo "========================================"
echo "  One API Linux Deployment Script"
echo "========================================"
echo ""

# Check if Docker is available
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo "[1/3] Docker detected, deploying via Docker..."
    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
    cd "$SCRIPT_DIR"
    docker build -t one-api:latest .
    docker stop one-api 2>/dev/null || true
    docker rm one-api 2>/dev/null || true
    mkdir -p /opt/one-api/data
    docker run -d --name one-api --restart always -p 3000:3000 \
        -v /opt/one-api/data:/data -e TZ=Asia/Shanghai \
        one-api:latest
    IP=$(hostname -I | awk "{print $1}")
    echo "✅ Deployed via Docker! Visit http://$IP:3000"
    echo "   Default admin: root / 123456"
    exit 0
fi

echo "[1/2] Building frontend..."
cd web/web-api
npm install 2>/dev/null || npm install --legacy-peer-deps 2>/dev/null
DISABLE_ESLINT_PLUGIN="true" npm run build
rm -rf ../build/web-api && mv -f build ../build/web-api
cd "$(dirname "$0")"

echo "[2/2] Compiling Go binary..."
export CGO_ENABLED=1
go build -trimpath -ldflags "-s -w" -o one-api

echo "Creating systemd service..."
mkdir -p /opt/one-api
cp -r . /opt/one-api/
mkdir -p /opt/one-api/logs

cat > /etc/systemd/system/one-api.service << 'SERVICEEOF'
[Unit]
Description=One API Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/one-api
ExecStart=/opt/one-api/one-api --port 3000 --log-dir /opt/one-api/logs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable one-api
systemctl restart one-api

IP=$(hostname -I | awk "{print $1}")
echo "✅ Deployed successfully! Visit http://$IP:3000"
echo "   Default admin: root / 123456"
echo "   Service commands: systemctl {start|stop|restart|status} one-api"
