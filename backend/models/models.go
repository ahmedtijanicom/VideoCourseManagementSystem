package models

type Video struct {
	Filename     string `json:"filename"`
	Title        string `json:"title"`
	HasSubtitles bool   `json:"hasSubtitles"`
	Path         string `json:"path"`
}

type Module struct {
	Name   string  `json:"name"`
	Path   string  `json:"path"`
	Videos []Video `json:"videos"`
}

type Course struct {
	Name    string   `json:"name"`
	Path    string   `json:"path"`
	Modules []Module `json:"modules"`
}

type CoursesResponse struct {
	Courses []Course `json:"courses"`
}
