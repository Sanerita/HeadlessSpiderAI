# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app
COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# Stage 2: Serve with Vite Dev Server (for dev)
FROM node:18

WORKDIR /app
COPY --from=builder /app /app
RUN npm install -g serve
CMD ["npm", "run", "dev"]
