# One API 前端部署命令

## 📋 部署步骤

### 步骤 1：本地打包前端文件

在本地项目目录执行：

```bash
cd /c/Users/Administrator/Desktop/新建文件夹/one-api-main
tar -czf web-air.tar.gz -C web/build air
```

### 步骤 2：上传到服务器

```bash
# 替换为你的服务器 IP
scp web-air.tar.gz root@你的服务器IP:/root/
```

### 步骤 3：在服务器上部署

SSH 登录服务器后执行：

```bash
# 创建容器内目录
docker exec -it one-api mkdir -p /app/web/build

# 复制文件到容器
docker cp /root/web-air.tar.gz one-api:/app/web/build/

# 在容器内解压
docker exec -it one-api sh -c "cd /app/web/build && tar -xzf web-air.tar.gz && rm web-air.tar.gz"

# 重启容器
docker restart one-api

# 清理服务器文件
rm -f /root/web-air.tar.gz
```

### 步骤 4：清理本地文件

```bash
rm -f web-air.tar.gz
```

---

## 🔄 一键部署（复制整段执行）

```bash
# 本地打包
cd /c/Users/Administrator/Desktop/新建文件夹/one-api-main && tar -czf web-air.tar.gz -C web/build air

# 上传（替换 IP）
scp web-air.tar.gz root@你的服务器IP:/root/

# 登录服务器执行
ssh root@你的服务器IP
docker exec -it one-api mkdir -p /app/web/build
docker cp /root/web-air.tar.gz one-api:/app/web/build/
docker exec -it one-api sh -c "cd /app/web/build && tar -xzf web-air.tar.gz && rm web-air.tar.gz"
docker restart one-api
rm -f /root/web-air.tar.gz
exit

# 清理本地
rm -f web-air.tar.gz
```

---

## ✅ 验证部署

部署完成后，访问：
- 地址：`http://你的服务器IP:3000`
- 账号：`root`
- 密码：`123456`

---

## 🐛 常见问题

### 问题 1：容器不存在

```bash
# 查看运行中的容器
docker ps

# 如果容器名不是 one-api，使用实际容器名
docker restart 实际容器名
```

### 问题 2：权限被拒绝

```bash
# 在服务器上执行
chmod 755 /root/web-air.tar.gz
```

### 问题 3：文件不存在

```bash
# 检查文件是否上传成功
ls -la /root/web-air.tar.gz
```
