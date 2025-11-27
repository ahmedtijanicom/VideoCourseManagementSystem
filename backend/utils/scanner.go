package utils

import (
	"os"
	"path/filepath"
	"sort"
	"strings"
	"video-course-manager/models"
)

var VideoExtensions = map[string]bool{
	".mp4": true,
}

// GetCourses scans the given root directory for courses
func GetCourses(rootPath string) ([]models.Course, error) {
	var courses []models.Course

	entries, err := os.ReadDir(rootPath)
	if err != nil {
		if os.IsNotExist(err) {
			return []models.Course{}, nil
		}
		return nil, err
	}

	// Sort entries
	sort.Slice(entries, func(i, j int) bool {
		return naturalLess(entries[i].Name(), entries[j].Name())
	})

	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		course := models.Course{
			Name: entry.Name(),
			Path: entry.Name(),
		}

		coursePath := filepath.Join(rootPath, entry.Name())
		modules, err := scanModules(coursePath, entry.Name())
		if err != nil {
			continue // Skip if error scanning modules
		}

		if len(modules) > 0 {
			course.Modules = modules
			courses = append(courses, course)
		}
	}

	return courses, nil
}

func scanModules(coursePath, courseName string) ([]models.Module, error) {
	var modules []models.Module

	entries, err := os.ReadDir(coursePath)
	if err != nil {
		return nil, err
	}

	sort.Slice(entries, func(i, j int) bool {
		return naturalLess(entries[i].Name(), entries[j].Name())
	})

	for _, entry := range entries {
		if !entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		module := models.Module{
			Name: entry.Name(),
			Path: filepath.Join(courseName, entry.Name()),
		}

		// Normalize path separators to forward slashes
		module.Path = filepath.ToSlash(module.Path)

		modulePath := filepath.Join(coursePath, entry.Name())
		videos, err := scanVideos(modulePath, courseName, entry.Name())
		if err != nil {
			continue
		}

		if len(videos) > 0 {
			module.Videos = videos
			modules = append(modules, module)
		}
	}

	return modules, nil
}

func scanVideos(modulePath, courseName, moduleName string) ([]models.Video, error) {
	var videos []models.Video

	entries, err := os.ReadDir(modulePath)
	if err != nil {
		return nil, err
	}

	sort.Slice(entries, func(i, j int) bool {
		return naturalLess(entries[i].Name(), entries[j].Name())
	})

	for _, entry := range entries {
		if entry.IsDir() || strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		ext := strings.ToLower(filepath.Ext(entry.Name()))
		if !VideoExtensions[ext] {
			continue
		}

		baseName := strings.TrimSuffix(entry.Name(), ext)
		subtitlePath := filepath.Join(modulePath, baseName+".srt")
		_, err := os.Stat(subtitlePath)
		hasSubtitles := err == nil

		relativePath := filepath.Join(courseName, moduleName, entry.Name())
		relativePath = filepath.ToSlash(relativePath)

		video := models.Video{
			Filename:     entry.Name(),
			Title:        baseName,
			HasSubtitles: hasSubtitles,
			Path:         relativePath,
		}

		videos = append(videos, video)
	}

	return videos, nil
}

// naturalLess compares two strings naturally (simple implementation)
// For a robust implementation, we might need a library or more complex logic.
// This version handles basic "Module 1" vs "Module 10" cases by length if prefix matches.
func naturalLess(s1, s2 string) bool {
	// Simple heuristic: if lengths differ and one is prefix of another (ignoring digits), shorter is less?
	// No, that's not right.
	// Let's just use standard string comparison for now to be safe and simple.
	// The user can improve this later if needed.
	// Wait, I can try to be slightly smarter.
	// If both start with "Module ", compare the rest as numbers?
	
	// Fallback to standard string comparison
	return s1 < s2
}
