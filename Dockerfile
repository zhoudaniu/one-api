# 1. 升级到更稳定、体积更小的 node:18-alpine，并保持 $BUILDPLATFORM 利用宿主机算力
FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

WORKDIR /web
COPY ./VERSION .
COPY ./web .

# 👈 修正：直接切换到前端独立目录，彻底避免 --prefix 带来的路径混乱
WORKDIR /web/web-api
RUN npm install

# 👈 修正：使用 tr -d '\r\n' 清洗掉可能存在的换行符，确保变量纯净；同时移除了 --prefix
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat ../VERSION | tr -d '\r\n') npm run build

# 👈 🚀 核心对齐：将生成的打包产物移动到 /web/build，完美对接下一阶段的 Go 复制指令
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
# 这里的源路径 /web/build 现在有正确的打包产物了
COPY --from=builder /web/build ./web/build

# 👈 修正：同样对 Go 编译时注入的版本号进行去换行符清洗，防止 ldflags 报错
RUN go build -trimpath -ldflags "-s -w -X 'github.com/songquanpeng/one-api/common.Version=$(cat VERSION | tr -d '\r\n')' -linkmode external -extldflags '-static'" -o one-api


FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder2 /build/one-api /

EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/one-api"]
