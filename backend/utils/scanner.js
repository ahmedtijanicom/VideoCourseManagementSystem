const fs = require('fs');
const path = require('path');

const VIDEO_EXTENSIONS = ['.mp4'];
const SUBTITLE_EXTENSIONS = ['.srt'];

/**
 * Natural sort function for strings.
 * e.g., "Module 1", "Module 2", "Module 10"
 */
const naturalSort = (a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Recursively scans the directory structure.
 * Structure: Course -> Module -> Video
 */
const scanDirectory = (dirPath, rootPath = dirPath) => {
    const items = [];
    
    if (!fs.existsSync(dirPath)) {
        return items;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    // Sort entries naturally
    entries.sort((a, b) => naturalSort(a.name, b.name));

    for (const entry of entries) {
        if (entry.name.startsWith('.')) continue; // Ignore hidden files

        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(rootPath, fullPath).replace(/\\/g, '/');

        if (entry.isDirectory()) {
            // Check depth or just treat as container
            // We assume 3 levels: Course -> Module -> Video
            // But for recursion, we just return the structure
            const children = scanDirectory(fullPath, rootPath);
            
            // If we are at the module level (videos inside), we might want to format differently
            // But for now, let's build a generic tree and format it for the API response later
            // OR we can try to detect if it's a course or module based on depth.
            
            // Let's stick to the generic tree for the scanner, and the API controller can format it.
            // Actually, the requirements are specific: Course -> Module -> Video.
            // Let's try to map it directly to the required structure if possible, 
            // or return a flexible tree.
            // The requirement says:
            // Level 1: Course
            // Level 2: Module
            // Level 3: Video
            
            items.push({
                name: entry.name,
                path: entry.name, // This might need adjustment based on depth
                type: 'directory',
                children: children
            });
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (VIDEO_EXTENSIONS.includes(ext)) {
                // Check for subtitle
                const baseName = path.basename(entry.name, ext);
                const subtitlePath = path.join(dirPath, baseName + '.srt');
                const hasSubtitles = fs.existsSync(subtitlePath);

                items.push({
                    filename: entry.name,
                    title: baseName,
                    hasSubtitles: hasSubtitles,
                    path: relativePath,
                    type: 'video'
                });
            }
        }
    }

    return items;
};

/**
 * Formats the raw tree into the specific API response format.
 * Expects:
 * /courses/
 *   [Course]/
 *     [Module]/
 *       Video.mp4
 */
const getCourses = (coursesRoot) => {
    if (!fs.existsSync(coursesRoot)) {
        return [];
    }

    const courses = [];
    const courseDirs = fs.readdirSync(coursesRoot, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .sort((a, b) => naturalSort(a.name, b.name));

    for (const courseDir of courseDirs) {
        const coursePath = path.join(coursesRoot, courseDir.name);
        const modules = [];
        
        const moduleDirs = fs.readdirSync(coursePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
            .sort((a, b) => naturalSort(a.name, b.name));

        for (const moduleDir of moduleDirs) {
            const modulePath = path.join(coursePath, moduleDir.name);
            const videos = [];
            
            const files = fs.readdirSync(modulePath, { withFileTypes: true })
                 .filter(dirent => dirent.isFile() && !dirent.name.startsWith('.'))
                 .sort((a, b) => naturalSort(a.name, b.name));

            for (const file of files) {
                const ext = path.extname(file.name).toLowerCase();
                if (VIDEO_EXTENSIONS.includes(ext)) {
                     const baseName = path.basename(file.name, ext);
                     const subtitlePath = path.join(modulePath, baseName + '.srt');
                     const hasSubtitles = fs.existsSync(subtitlePath);
                     
                     // Relative path from courses root
                     const relativePath = path.join(courseDir.name, moduleDir.name, file.name).replace(/\\/g, '/');

                     videos.push({
                         filename: file.name,
                         title: baseName,
                         hasSubtitles: hasSubtitles,
                         path: relativePath
                     });
                }
            }

            if (videos.length > 0) {
                modules.push({
                    name: moduleDir.name,
                    path: path.join(courseDir.name, moduleDir.name).replace(/\\/g, '/'),
                    videos: videos
                });
            }
        }

        if (modules.length > 0) {
            courses.push({
                name: courseDir.name,
                path: courseDir.name,
                modules: modules
            });
        }
    }

    return courses;
};

module.exports = { getCourses };
