# Backend Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Final Stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN npm prune --production

# Security: Run as non-root user
USER node

EXPOSE 5000
CMD ["node", "src/server.js"]
