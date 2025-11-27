package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"video-course-manager/models"
	"video-course-manager/utils"
)

var CoursesRoot string

func Init(root string) {
	CoursesRoot = root
}

func GetCourses(w http.ResponseWriter, r *http.Request) {
	courses, err := utils.GetCourses(CoursesRoot)
	if err != nil {
		http.Error(w, "Failed to scan courses", http.StatusInternalServerError)
		fmt.Printf("Error scanning courses: %v\n", err)
		return
	}

	response := models.CoursesResponse{
		Courses: courses,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func validatePath(course, module, filename string) error {
	if strings.Contains(course, "..") || strings.Contains(module, "..") || strings.Contains(filename, "..") {
		return fmt.Errorf("invalid path")
	}
	if strings.HasPrefix(filename, ".") {
		return fmt.Errorf("access denied")
	}
	return nil
}

func StreamVideo(w http.ResponseWriter, r *http.Request) {
	// Extract params from URL manually since we are using standard net/http or we can use a router library.
	// Assuming we use a router that puts params in context or we parse path.
	// Let's assume we use standard ServeMux with StripPrefix or similar, 
	// but standard mux in Go 1.21 doesn't support named params easily without parsing.
	// I'll implement a simple path parser in the main handler or here.
	
	// Actually, let's assume the router passes the path.
	// For simplicity in main.go, I'll use `http.StripPrefix` and handle the rest here.
	// Path format: /api/video/{course}/{module}/{filename}
	
	pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/"), "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	course := pathParts[0]
	module := pathParts[1]
	filename := pathParts[2]

	// Handle cases where module or course names might have slashes? No, they shouldn't.
	// But wait, if filename has spaces, they are URL encoded. r.URL.Path is decoded? 
	// No, r.URL.Path is not decoded. We need to decode.
	
	// Let's rely on the caller to pass decoded strings or decode them here.
	// It's safer to decode here.
	var err error
	// Helper to decode
	decode := func(s string) string {
		res, _ := urlDecode(s)
		return res
	}

	course = decode(course)
	module = decode(module)
	filename = decode(filename)

	if err := validatePath(course, module, filename); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(CoursesRoot, course, module, filename)

	if filepath.Ext(filename) != ".mp4" {
		http.Error(w, "Invalid file type", http.StatusBadRequest)
		return
	}

	file, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Video not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	stat, err := file.Stat()
	if err != nil {
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	fileSize := stat.Size()
	rangeHeader := r.Header.Get("Range")

	if rangeHeader != "" {
		parts := strings.Split(strings.Replace(rangeHeader, "bytes=", "", 1), "-")
		start, _ := strconv.ParseInt(parts[0], 10, 64)
		
		var end int64
		if len(parts) > 1 && parts[1] != "" {
			end, _ = strconv.ParseInt(parts[1], 10, 64)
		} else {
			end = fileSize - 1
		}

		if start > end || start < 0 || end >= fileSize {
			http.Error(w, "Range not satisfiable", http.StatusRequestedRangeNotSatisfiable)
			return
		}

		chunkSize := end - start + 1
		w.Header().Set("Content-Range", fmt.Sprintf("bytes %d-%d/%d", start, end, fileSize))
		w.Header().Set("Accept-Ranges", "bytes")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", chunkSize))
		w.Header().Set("Content-Type", "video/mp4")
		w.WriteHeader(http.StatusPartialContent)

		file.Seek(start, 0)
		io.CopyN(w, file, chunkSize)
	} else {
		w.Header().Set("Content-Length", fmt.Sprintf("%d", fileSize))
		w.Header().Set("Content-Type", "video/mp4")
		w.WriteHeader(http.StatusOK)
		io.Copy(w, file)
	}
}

func GetSubtitles(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.TrimPrefix(r.URL.Path, "/"), "/")
	if len(pathParts) < 3 {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	// Decode
	decode := func(s string) string {
		res, _ := urlDecode(s)
		return res
	}

	course := decode(pathParts[0])
	module := decode(pathParts[1])
	filename := decode(pathParts[2])

	if err := validatePath(course, module, filename); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	filePath := filepath.Join(CoursesRoot, course, module, filename)

	if filepath.Ext(filename) != ".srt" {
		http.Error(w, "Invalid file type", http.StatusBadRequest)
		return
	}

	file, err := os.Open(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			http.Error(w, "Subtitle not found", http.StatusNotFound)
			return
		}
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	io.Copy(w, file)
}

func urlDecode(s string) (string, error) {
	return url.PathUnescape(s)
}

// javaScriptDecodeURI simulates decodeURI to match JS behavior if needed,
// but standard url.QueryUnescape is usually what we want for path segments.
// I will add "net/url" to imports in the next step or just use a placeholder and fix imports.
// Wait, I can't edit imports easily without rewriting the file.
// I'll assume I can add "net/url" to the imports block above.
// I'll rewrite the file with "net/url" included.
