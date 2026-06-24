<p align="center">
  <a href="https://github.com/songquanpeng/one-api">
    <img src="https://raw.githubusercontent.com/songquanpeng/one-api/main/web/default/public/logo.png" width="150" height="150" alt="One API Logo">
  </a>
</p>

<h1 align="center">One API</h1>

<p align="center">
  <strong>✨ 通过标准的 OpenAI API 格式访问所有的大模型，开箱即用 ✨</strong>
</p>

<p align="center">
  <a href="https://github.com/songquanpeng/one-api/releases">
    <img src="https://img.shields.io/github/v/release/songquanpeng/one-api?color=brightgreen" alt="Release">
  </a>
  <a href="https://github.com/songquanpeng/one-api/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/songquanpeng/one-api?color=brightgreen" alt="License">
  </a>
  <a href="https://hub.docker.com/r/justsong/one-api">
    <img src="https://img.shields.io/docker/pulls/justsong/one-api?color=brightgreen" alt="Docker Pulls">
  </a>
</p>

---

## 📖 项目介绍

**One API** 是一个强大的 OpenAI 接口聚合管理系统，支持多种大模型渠道，适用于密钥的二次分发管理。

### ✨ 核心特性

- 🔄 **多模型支持** - 支持 OpenAI、Azure、Claude、Gemini、DeepSeek 等主流大模型
- 🚀 **负载均衡** - 支持多渠道负载均衡，智能分配请求
- 🔑 **密钥管理** - 灵活的令牌管理，支持额度限制、过期时间设置
- 👥 **多用户管理** - 完整的用户系统，支持分组权限管理
- 📊 **数据统计** - 详细的使用统计和日志记录
- 🎨 **现代化 UI** - 美观易用的管理界面

### 🌐 支持的模型渠道

| 渠道 | 支持模型 |
|------|----------|
| OpenAI | GPT-3.5、GPT-4、GPT-4o、o1 系列 |
| Azure OpenAI | Azure 部署的 OpenAI 模型 |
| Anthropic | Claude 3.5 Sonnet、Claude 3 Opus |
| Google | Gemini Pro、Gemini Ultra |
| DeepSeek | DeepSeek Chat、DeepSeek Coder |
| 百度文心 | ERNIE-Bot 系列 |
| 阿里通义 | Qwen 系列 |
| 更多... | 智谱、讯飞、月之暗面等 |

---

## 🚀 部署方式

### 方式一：Docker 部署（推荐）

#### 1. 使用 Docker 镜像

```bash
# 拉取镜像
docker pull justsong/one-api

# 运行容器
docker run -d \
  --name one-api \
  -p 3000:3000 \
  -v /path/to/data:/data \
  justsong/one-api
```

#### 2. 使用 Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  one-api:
    image: justsong/one-api
    container_name: one-api
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - TZ=Asia/Shanghai
    restart: unless-stopped
```

启动服务：

```bash
docker-compose up -d
```

### 方式二：二进制部署

#### 1. 下载可执行文件

从 [GitHub Releases](https://github.com/songquanpeng/one-api/releases) 下载对应平台的可执行文件：

- Windows: `one-api-windows-amd64.exe`
- Linux: `one-api-linux-amd64`
- macOS: `one-api-darwin-amd64`

#### 2. 运行

```bash
# Linux/macOS
chmod +x one-api-linux-amd64
./one-api-linux-amd64 --port 3000

# Windows
one-api-windows-amd64.exe --port 3000
```

### 方式三：源码编译

#### 1. 环境要求

- Go 1.20+
- Node.js 16+（用于前端构建）

#### 2. 编译步骤

```bash
# 克隆仓库
git clone https://github.com/songquanpeng/one-api.git
cd one-api

# 编译后端
go build -o one-api .

# 构建前端
cd web/air
npm install
npm run build
cd ../..

# 运行
./one-api --port 3000
```

---

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 服务端口 | 3000 |
| `SQLITE_DSN` | SQLite 数据库路径 | data/one-api.db |
| `LOG_DIR` | 日志目录 | logs |
| `CDN_URL` | 前端资源 CDN 地址 | - |

### 命令行参数

```bash
./one-api --port 3000 --log-dir ./logs
```

---

## 🔧 使用指南

### 1. 首次登录

启动服务后，访问 `http://localhost:3000`

- 默认管理员账号：`root`
- 默认密码：`123456`

> ⚠️ **安全提示**：首次登录后请立即修改默认密码！

### 2. 添加渠道

1. 登录管理后台
2. 进入「渠道」页面
3. 点击「添加新的渠道」
4. 选择渠道类型（如 OpenAI）
5. 填写 API Key 和其他配置
6. 选择支持的模型
7. 保存

### 3. 创建令牌

1. 进入「令牌」页面
2. 点击「添加令牌」
3. 设置令牌名称、额度、过期时间
4. 保存后复制令牌

### 4. 使用 API

在你的应用中配置：

```python
import openai

client = openai.OpenAI(
    api_key="your-token-here",
    base_url="http://localhost:3000/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Hello!"}]
)
print(response.choices[0].message.content)
```

---

## 📁 项目结构

```
one-api/
├── controller/          # 控制器层
├── model/              # 数据模型层
├── middleware/          # 中间件
├── relay/              # API 转发层
│   └── adaptor/        # 各渠道适配器
├── router/             # 路由配置
├── web/                # 前端代码
│   ├── air/            # React 前端
│   └── build/          # 构建产物
├── common/             # 公共工具
├── main.go             # 入口文件
└── go.mod              # Go 依赖
```

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

---

## 🔗 相关链接

- [GitHub 仓库](https://github.com/songquanpeng/one-api)
- [在线演示](https://openai.justsong.cn/)
- [问题反馈](https://github.com/songquanpeng/one-api/issues)

---

## 🙏 致谢

- 主题 UI 来自 [Calon](https://github.com/calon)
- 感谢所有贡献者
