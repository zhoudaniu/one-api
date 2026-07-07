FROM --platform=$BUILDPLATFORM node:18-alpine AS builder

WORKDIR /web
COPY ./VERSION .
COPY ./web .

WORKDIR /web/web-api
RUN npm install

# 💡 核心修复：绕过 package.json 中残存的 mv 命令，直接调用编译核心，纯净打包
RUN DISABLE_ESLINT_PLUGIN='true' REACT_APP_VERSION=$(cat ../VERSION | tr -d '\r\n') npx react-scripts build

# 👈 将产物移动到正确的子目录，与 web.go 中的 Theme 路径对应
# web.go 中期望 web/build/web-api/index.html，而不是 web/build/index.html
RUN rm -rf /web/build/web-api && mkdir -p /web/build/web-api && mv build/* /web/build/web-api/


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

RUN go build -trimpath -ldflags "-s -w -X 'github.com/songquanpeng/one-api/common.Version=$(cat VERSION | tr -d '\r\n')' -linkmode external -extldflags '-static'" -o one-api


FROM alpine:latest

RUN apk add --no-cache ca-certificates tzdata

COPY --from=builder2 /build/one-api /

EXPOSE 3000
WORKDIR /data
ENTRYPOINT ["/one-api"]
