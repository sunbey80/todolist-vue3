# --- 第一阶段：构建 (Build Stage) ---
    FROM registry.cn-hangzhou.aliyuncs.com/google_containers/node:24-alpine as builder
    WORKDIR /app
    # 单独复制 package.json 利用缓存
    COPY package*.json ./
    # 安装依赖 (如果是国内服务器构建，可以加淘宝源，但 ACR 海外机器构建不需要)
    RUN npm install
    # 复制所有源代码
    COPY . .
    # 打包生成 dist 目录
    RUN npm run build
    
    # --- 第二阶段：生产部署 (Production Stage) ---
    FROM registry.cn-hangzhou.aliyuncs.com/google_containers/nginx:alpine
    # 1. 把第一阶段打包好的 dist 文件夹复制到 Nginx 默认目录
    COPY --from=builder /app/dist /usr/share/nginx/html
    # 2. 把我们写的 nginx.conf 复制进去替换默认配置
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]