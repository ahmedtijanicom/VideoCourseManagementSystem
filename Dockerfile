# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Setup Backend
FROM node:18-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend code
COPY backend/ .

# Copy built frontend assets to 'public' directory in backend
COPY --from=frontend-build /app/frontend/dist ./public

# Create courses directory (mount point)
RUN mkdir -p /courses

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV COURSES_PATH=/courses

EXPOSE 3000

CMD ["node", "server.js"]
