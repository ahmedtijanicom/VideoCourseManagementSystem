require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve static files from the React frontend app
// In production (Docker), we will copy the build to 'public' or similar
// For now, let's assume 'public' folder in backend root or similar strategy
// The plan said "Serve static frontend files".
// Let's assume the frontend build will be in ../frontend/dist and we serve it.
// Or we can just serve it from a 'public' folder inside backend if we copy it there.
// Let's check if we are in production or dev.
// In dev, we might not serve frontend from here, but for the Docker build we will.

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    
    app.get('*', (req, res) => {
        // Don't intercept API calls
        if (req.path.startsWith('/api') || req.path.startsWith('/video') || req.path.startsWith('/subtitles')) {
            return res.status(404).send('Not found');
        }
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Courses path: ${process.env.COURSES_PATH || path.join(__dirname, '../courses')}`);
});
