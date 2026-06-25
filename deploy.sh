#!/bin/bash

# One API 自定义版本部署脚本
# 使用方法：./deploy.sh [Docker Hub 用户名]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 打印带颜色的消息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    print_info "Docker 已安装"
}

# 检查 Docker 是否运行
check_docker_running() {
    if ! docker info &> /dev/null; then
        print_error "Docker 未运行，请启动 Docker"
        exit 1
    fi
    print_info "Docker 正在运行"
}

# 构建 Docker 镜像
build_image() {
    print_info "开始构建 Docker 镜像..."

    # 构建镜像
    docker build -t one-api-custom:latest .

    if [ $? -eq 0 ]; then
        print_info "镜像构建成功！"
    else
        print_error "镜像构建失败"
        exit 1
    fi
}

# 推送镜像到 Docker Hub
push_image() {
    local username=$1

    if [ -z "$username" ]; then
        print_warn "未指定 Docker Hub 用户名，跳过推送"
        return
    fi

    print_info "登录 Docker Hub..."
    docker login

    print_info "给镜像打标签..."
    docker tag one-api-custom:latest $username/one-api-custom:latest

    print_info "推送镜像到 Docker Hub..."
    docker push $username/one-api-custom:latest

    if [ $? -eq 0 ]; then
        print_info "镜像推送成功！"
    else
        print_error "镜像推送失败"
        exit 1
    fi
}

# 本地测试
test_local() {
    print_info "启动本地测试容器..."

    # 停止并删除旧容器
    docker stop one-api-test 2>/dev/null || true
    docker rm one-api-test 2>/dev/null || true

    # 启动新容器
    docker run -d \
        --name one-api-test \
        -p 3000:3000 \
        -v $(pwd)/data:/data \
        one-api-custom:latest

    print_info "容器已启动，等待服务就绪..."
    sleep 5

    # 检查服务状态
    if curl -s http://localhost:3000/api/status > /dev/null; then
        print_info "✅ 本地测试成功！访问 http://localhost:3000"
    else
        print_warn "服务可能还在启动中，请稍后访问 http://localhost:3000"
    fi
}

# 主菜单
show_menu() {
    echo ""
    echo "=========================================="
    echo "    One API 自定义版本部署脚本"
    echo "=========================================="
    echo ""
    echo "1. 仅构建镜像"
    echo "2. 构建并本地测试"
    echo "3. 构建并推送到 Docker Hub"
    echo "4. 退出"
    echo ""
    read -p "请选择操作 [1-4]: " choice
}

# 主函数
main() {
    check_docker
    check_docker_running

    show_menu

    case $choice in
        1)
            build_image
            ;;
        2)
            build_image
            test_local
            ;;
        3)
            read -p "请输入 Docker Hub 用户名: " username
            build_image
            push_image $username
            echo ""
            print_info "在服务器上执行以下命令部署："
            echo "docker pull $username/one-api-custom:latest"
            echo "docker stop one-api"
            echo "docker rm one-api"
            echo "docker run -d --name one-api -p 3000:3000 -v /root/one-api/data:/data $username/one-api-custom:latest"
            ;;
        4)
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
