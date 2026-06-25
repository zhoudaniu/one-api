# One API 自定义版本部署指南

## 📋 前置要求

- 本地安装 Docker Desktop
- Docker Hub 账号（用于推送镜像）
- 服务器已安装 Docker 和 Docker Compose

---

## 🚀 快速部署

### 方式一：使用部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行脚本
./deploy.sh
```

### 方式二：手动部署

#### 步骤 1：构建 Docker 镜像

```bash
# 进入项目目录
cd /c/Users/Administrator/Desktop/新建文件夹/one-api-main

# 构建镜像
docker build -t one-api-custom:latest .

# 验证镜像
docker images | grep one-api-custom
```

#### 步骤 2：推送到 Docker Hub

```bash
# 登录 Docker Hub
docker login

# 打标签
docker tag one-api-custom:latest your-username/one-api-custom:latest

# 推送
docker push your-username/one-api-custom:latest
```

#### 步骤 3：在服务器上部署

```bash
# 拉取镜像
docker pull your-username/one-api-custom:latest

# 停止旧容器
docker stop one-api
docker rm one-api

# 启动新容器
docker run -d \
  --name one-api \
  --restart always \
  -p 3000:3000 \
  -v /root/one-api/data:/data \
  -e TZ=Asia/Shanghai \
  your-username/one-api-custom:latest
```

---

## 🐳 Docker Compose 部署

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  one-api:
    image: your-username/one-api-custom:latest
    container_name: one-api
    restart: always
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - TZ=Asia/Shanghai
```

### 部署命令

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 🔧 Nginx 反向代理配置

### 创建 Nginx 配置文件

```bash
sudo vim /etc/nginx/conf.d/one-api.conf
```

### 配置内容

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书（如果使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 代理配置
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 测试并重载 Nginx

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx
```

---

## 📁 目录结构

```
/root/one-api/
├── data/              # 数据目录
│   ├── one-api.db     # SQLite 数据库
│   └── logs/          # 日志目录
├── docker-compose.yml # Docker Compose 配置
└── .env               # 环境变量（可选）
```

---

## 🔐 安全建议

### 1. 修改默认密码

首次登录后立即修改默认密码：
- 默认用户名：`root`
- 默认密码：`123456`

### 2. 配置防火墙

```bash
# 只允许必要端口
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 3. 使用 HTTPS

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 🐛 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000

# 停止占用进程
sudo kill -9 <PID>
```

### 2. 容器启动失败

```bash
# 查看容器日志
docker logs one-api

# 检查容器状态
docker ps -a
```

### 3. 数据库权限问题

```bash
# 修改数据目录权限
sudo chmod -R 755 /root/one-api/data
sudo chown -R 1000:1000 /root/one-api/data
```

---

## 📊 监控和日志

### 查看实时日志

```bash
docker logs -f one-api
```

### 查看容器资源使用

```bash
docker stats one-api
```

### 备份数据

```bash
# 备份数据库
cp /root/one-api/data/one-api.db /backup/one-api-$(date +%Y%m%d).db

# 或使用 Docker 卷备份
docker run --rm -v one-api-data:/data -v $(pwd):/backup alpine \
  tar czf /backup/one-api-data-$(date +%Y%m%d).tar.gz /data
```

---

## 🔄 更新部署

```bash
# 1. 拉取新镜像
docker pull your-username/one-api-custom:latest

# 2. 停止旧容器
docker stop one-api

# 3. 备份数据
cp /root/one-api/data/one-api.db /backup/

# 4. 删除旧容器
docker rm one-api

# 5. 启动新容器
docker run -d \
  --name one-api \
  --restart always \
  -p 3000:3000 \
  -v /root/one-api/data:/data \
  your-username/one-api-custom:latest
```

---

## 📞 技术支持

如有问题，请查看：
- 项目文档：README.md
- GitHub Issues：https://github.com/songquanpeng/one-api/issues
