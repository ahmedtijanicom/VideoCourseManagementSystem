const express = require('express');
const path = require('path');
const fs = require('fs');
const { getCourses } = require('../utils/scanner');

const router = express.Router();
const COURSES_ROOT = process.env.COURSES_PATH || path.join(__dirname, '../../courses');

// Middleware to validate path parameters
const validatePath = (req, res, next) => {
    const { course, module: moduleName, filename } = req.params;
    
    // Check for directory traversal attempts
    if (course.includes('..') || moduleName.includes('..') || filename.includes('..')) {
        return res.status(400).send('Invalid path');
    }
    
    // Check for hidden files
    if (filename.startsWith('.')) {
        return res.status(403).send('Access denied');
    }

    next();
};

// GET /api/courses
router.get('/courses', (req, res) => {
    try {
        const courses = getCourses(COURSES_ROOT);
        res.json({ courses });
    } catch (error) {
        console.error('Error scanning courses:', error);
        res.status(500).json({ error: 'Failed to scan courses' });
    }
});

// GET /video/:course/:module/:filename
router.get('/video/:course/:module/:filename', validatePath, (req, res) => {
    const { course, module: moduleName, filename } = req.params;
    const filePath = path.join(COURSES_ROOT, course, moduleName, filename);

    // Validate extension
    if (path.extname(filename).toLowerCase() !== '.mp4') {
        return res.status(400).send('Invalid file type');
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Video not found');
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

// GET /subtitles/:course/:module/:filename
router.get('/subtitles/:course/:module/:filename', validatePath, (req, res) => {
    const { course, module: moduleName, filename } = req.params;
    const filePath = path.join(COURSES_ROOT, course, moduleName, filename);

    // Validate extension
    if (path.extname(filename).toLowerCase() !== '.srt') {
        return res.status(400).send('Invalid file type');
    }

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Subtitle not found');
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    fs.createReadStream(filePath).pipe(res);
});

module.exports = router;
