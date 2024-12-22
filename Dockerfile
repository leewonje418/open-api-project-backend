FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install  
# node_modules 설치 (컨테이너 내부)
COPY . .

RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]

