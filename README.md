# Video Course Management System

A self-hosted, filesystem-based video course management system that automatically discovers and organizes educational content. It features a modern React frontend with a high-performance Go backend, packaged in a single Docker container.

## Features

- **Automatic Discovery**: Simply drop your course folders into the `courses` directory. The system scans them automatically.
- **Natural Sorting**: Intelligently sorts courses, modules, and videos (e.g., "Module 1", "Module 2", "Module 10").
- **Video Streaming**: Supports efficient video streaming with seeking capabilities.
- **Subtitle Support**: Automatically detects and serves `.srt` subtitles.
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing.
- **Responsive Design**: Works great on desktops, tablets, and mobile devices.
- **Dockerized**: Easy to deploy with Docker Compose.

## Directory Structure

The system expects a strict three-level directory structure:

```
/courses/
├── [Course Name]/              # Level 1: Course folders
│   ├── [Module Name]/          # Level 2: Module folders
│   │   ├── video1.mp4          # Level 3: Video files
│   │   ├── video1.srt          # Level 3: Optional subtitles
│   │   ├── video2.mp4
│   │   └── ...
│   └── ...
└── ...
```

- **Videos**: Must have `.mp4` extension.
- **Subtitles**: Must have `.srt` extension and match the video filename (e.g., `lecture.mp4` and `lecture.srt`).

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine.

### Installation & Running

1.  **Clone or Download** this repository.
2.  **Prepare Content**: Create a `courses` directory in the project root and add your course content following the structure above.
3.  **Start the Application**:

    ```bash
    docker-compose up -d --build
    ```

4.  **Access the App**: Open your browser and navigate to `http://localhost:6111` (Port configured in `docker-compose.yml`).

### Stopping the Application

```bash
docker-compose down
```

## Configuration

- **Port**: By default, the application runs on port `6111`. You can change this in `docker-compose.yml`.
- **Content Path**: The `courses` directory is mounted as a volume. You can point this to any directory on your host system by modifying `docker-compose.yml`.

## Development

### Backend
- **Stack**: Go (Golang)
- **Location**: `backend/`
- **Run Locally**: `cd backend && go run main.go`

### Frontend
- **Stack**: React, Vite
- **Location**: `frontend/`
- **Run Locally**: `cd frontend && npm install && npm run dev`

## License

MIT
