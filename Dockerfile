FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

WORKDIR /web
COPY ./VERSION .
COPY ./web .

WORKDIR /web/web-api
RUN npm install

# 💡 核心修复：绕过 package.json 中残存的 mv 命令，直接调用编译核心，纯净打包
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat ../VERSION | tr -d '\r\n') npx react-scripts build

# 👈 在这里手动、安全地将产物移动到 /web/build，确保 100% 对接下一阶段
RUN mv build /web/build


FROM golang:alpine AS builder2

RUN apk add --no-cache \
    gcc \
    musl-dev \
    sqlite-dev \
    build-base

ENV GO111MODULE=on \
    CGO_ENABLED=1 \
    GOOS=linux

WORKDIR /build

ADD go.mod go.sum ./
RUN go mod download

COPY . .
COPY --from=builder /web/build ./web/build

# 👈 在这后面添加下面这行代码来打印文件列表
RUN echo "=== 正在检查 ./web/build 目录下的内容 ===" && ls -la ./web/build


# 👈 在这后面添加下面这行代码来打印文件列表
RUN echo "=== 正在检查 /web/build 目录下的内容 ===" && ls -la /web/build

RUN go build -trimpath -ldflags "-s -w -X 'github.com/songquanpeng/one-api/common.Version=$(cat VERSION | tr -d '\r\n')' -linkmode external -extldflags '-static'" -o one-api


FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder2 /build/one-api /

EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/one-api"]
