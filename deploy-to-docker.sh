#!/bin/bash

# One API 前端部署到 Docker 容器脚本
# 使用方法：./deploy-to-docker.sh [服务器IP] [用户名]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# 配置
SERVER_IP=${1:-"your-server-ip"}
SERVER_USER=${2:-"root"}
CONTAINER_NAME="one-api"
REMOTE_DIR="/root"
LOCAL_BUILD_DIR="web/build/web-api"

# 步骤 1：本地打包前端文件
print_info "步骤 1：打包前端文件..."
cd /c/Users/Administrator/Desktop/新建文件夹/one-api-main
tar -czf web-web-api.tar.gz -C web/build web-api
print_info "前端文件已打包：web-web-api.tar.gz"

# 步骤 2：上传到服务器
print_info "步骤 2：上传到服务器..."
scp web-web-api.tar.gz ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/
print_info "文件已上传到服务器"

# 步骤 3：在服务器上操作
print_info "步骤 3：在服务器上部署..."
ssh ${SERVER_USER}@${SERVER_IP} << 'EOF'
    # 创建目录
    docker exec -it one-api mkdir -p /app/web/build

    # 复制文件到容器
    docker cp /root/web-web-api.tar.gz one-api:/app/web/build/

    # 在容器内解压
    docker exec -it one-api sh -c "cd /app/web/build && tar -xzf web-web-api.tar.gz && rm web-web-api.tar.gz"

    # 重启容器
    docker restart one-api

    # 清理本地文件
    rm -f /root/web-web-api.tar.gz

    echo "✅ 部署完成！"
EOF

# 步骤 4：清理本地文件
print_info "步骤 4：清理本地文件..."
rm -f web-web-api.tar.gz

print_info "✅ 所有步骤完成！"
echo ""
echo "=========================================="
echo "  访问地址：http://${SERVER_IP}:3000"
echo "  默认账号：root"
echo "  默认密码：123456"
echo "=========================================="
