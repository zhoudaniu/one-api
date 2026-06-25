#!/bin/bash

# One API 服务器端部署脚本
# 在服务器上运行此脚本

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 配置
DOCKER_IMAGE="your-username/one-api-custom:latest"  # 修改为你的 Docker Hub 用户名
CONTAINER_NAME="one-api"
DATA_DIR="/root/one-api/data"
PORT=3000

# 停止旧容器
stop_container() {
    print_info "停止旧容器..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
}

# 拉取新镜像
pull_image() {
    print_info "拉取最新镜像..."
    docker pull $DOCKER_IMAGE
}

# 创建数据目录
create_data_dir() {
    print_info "创建数据目录..."
    mkdir -p $DATA_DIR
}

# 启动新容器
start_container() {
    print_info "启动新容器..."
    docker run -d \
        --name $CONTAINER_NAME \
        --restart always \
        -p $PORT:3000 \
        -v $DATA_DIR:/data \
        -e TZ=Asia/Shanghai \
        $DOCKER_IMAGE

    print_info "容器已启动，等待服务就绪..."
    sleep 10
}

# 检查服务状态
check_service() {
    print_info "检查服务状态..."
    if curl -s http://localhost:$PORT/api/status > /dev/null; then
        print_info "✅ 部署成功！"
        echo ""
        echo "=========================================="
        echo "  访问地址: http://$(hostname -I | awk '{print $1}'):$PORT"
        echo "  默认账号: root"
        echo "  默认密码: 123456"
        echo "=========================================="
    else
        print_warn "服务可能还在启动中，请稍后访问"
    fi
}

# 显示菜单
show_menu() {
    echo ""
    echo "=========================================="
    echo "    One API 服务器端部署脚本"
    echo "=========================================="
    echo ""
    echo "1. 部署/更新服务"
    echo "2. 查看服务状态"
    echo "3. 查看日志"
    echo "4. 重启服务"
    echo "5. 停止服务"
    echo "6. 退出"
    echo ""
    read -p "请选择操作 [1-6]: " choice
}

# 主函数
main() {
    show_menu

    case $choice in
        1)
            stop_container
            pull_image
            create_data_dir
            start_container
            check_service
            ;;
        2)
            docker ps | grep $CONTAINER_NAME
            ;;
        3)
            docker logs -f $CONTAINER_NAME
            ;;
        4)
            print_info "重启服务..."
            docker restart $CONTAINER_NAME
            sleep 5
            check_service
            ;;
        5)
            print_info "停止服务..."
            docker stop $CONTAINER_NAME
            ;;
        6)
            print_info "退出"
            exit 0
            ;;
        *)
            print_error "无效选择"
            exit 1
            ;;
    esac
}

# 运行主函数
main
