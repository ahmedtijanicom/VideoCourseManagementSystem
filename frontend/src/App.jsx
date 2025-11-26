import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import VideoList from './components/VideoList';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

function App() {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode === 'true';
    });

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    useEffect(() => {
        fetch(`${API_BASE}/api/courses`)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch courses');
                return res.json();
            })
            .then(data => {
                setCourses(data.courses);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const handleSelectModule = (course, module) => {
        setSelectedCourse(course);
        setSelectedModule(module);
        setSelectedVideo(null); // Reset video when changing module
        // On mobile, we might want to close sidebar or switch view, but let's keep it simple for now
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    };

    const handleSelectVideo = (video) => {
        setSelectedVideo(video);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    if (loading) return <div className="loading">Loading courses...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="app-container">
            <header className="app-header">
                <button className="menu-toggle" onClick={toggleSidebar}>☰</button>
                <h1>Video Course Manager</h1>
                <button className="theme-toggle" onClick={toggleDarkMode}>
                    {darkMode ? '☀️' : '🌙'}
                </button>
            </header>
            <div className="main-content">
                <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
                    <Sidebar
                        courses={courses}
                        onSelectModule={handleSelectModule}
                        selectedModule={selectedModule}
                    />
                </div>
                <div className="content-area">
                    <div className="video-player-section">
                        <VideoPlayer
                            video={selectedVideo}
                            course={selectedCourse}
                            module={selectedModule}
                        />
                    </div>
                    <div className="video-list-section">
                        <VideoList
                            module={selectedModule}
                            onSelectVideo={handleSelectVideo}
                            selectedVideo={selectedVideo}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
