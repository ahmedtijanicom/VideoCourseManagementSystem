package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"video-course-manager/handlers"
)

func main() {
	// Configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	coursesPath := os.Getenv("COURSES_PATH")
	if coursesPath == "" {
		// Default to ../courses relative to executable or current working directory
		// In Docker, it will be set to /courses
		coursesPath = "../courses"
	}

	// Initialize handlers
	handlers.Init(coursesPath)

	// API Routes
	http.HandleFunc("/api/courses", handlers.GetCourses)
	
	// Video streaming and subtitles
	// Using StripPrefix to remove /api/video/ so handlers get the rest of the path
	http.Handle("/api/video/", http.StripPrefix("/api/video/", http.HandlerFunc(handlers.StreamVideo)))
	http.Handle("/api/subtitles/", http.StripPrefix("/api/subtitles/", http.HandlerFunc(handlers.GetSubtitles)))

	// Serve static files (Frontend)
	// In production (Docker), frontend build is copied to ./public
	fs := http.FileServer(http.Dir("./public"))
	
	// Serve index.html for unknown routes (SPA support)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if it's an API request that wasn't matched
		if len(r.URL.Path) >= 4 && r.URL.Path[:4] == "/api" {
			http.NotFound(w, r)
			return
		}

		// Check if file exists in public
		path := filepath.Join("./public", r.URL.Path)
		_, err := os.Stat(path)
		if err == nil && r.URL.Path != "/" {
			fs.ServeHTTP(w, r)
			return
		}

		// Serve index.html
		http.ServeFile(w, r, "./public/index.html")
	})

	fmt.Printf("Server is running on port %s\n", port)
	fmt.Printf("Courses path: %s\n", coursesPath)
	
	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
