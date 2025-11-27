# Stage 1: Build Frontend
FROM node:18-alpine as frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Setup Backend (Go)
FROM golang:1.21-alpine

WORKDIR /app

# Copy backend code
COPY backend/ .

# Build Go application
RUN go mod download
RUN go build -o video-course-manager .

# Copy built frontend assets to 'public' directory in backend
COPY --from=frontend-build /app/frontend/dist ./public

# Create courses directory (mount point)
RUN mkdir -p /courses

# Environment variables
ENV PORT=3000
ENV COURSES_PATH=/courses

EXPOSE 3000

CMD ["./video-course-manager"]
