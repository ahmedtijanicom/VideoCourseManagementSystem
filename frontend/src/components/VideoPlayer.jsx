import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ video, course, module }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, [video]);

    if (!video || !course || !module) {
        return <div className="video-player-placeholder">Select a video to play</div>;
    }

    // Encode paths for URL
    const encodedCourse = encodeURIComponent(course.name);
    const encodedModule = encodeURIComponent(module.name);
    const encodedFilename = encodeURIComponent(video.filename);
    const encodedSubtitle = encodeURIComponent(video.title + '.srt');

    // Base API URL - assuming backend is on localhost:3000 for now
    // In production/docker, it will be relative /api...
    // But since we are in dev, we might need full path or proxy.
    // Let's use a relative path and assume we'll set up a proxy or run on same origin in prod.
    // For dev, we can hardcode or use env var.
    const API_BASE = import.meta.env.VITE_API_URL || '';

    const videoSrc = `${API_BASE}/api/video/${encodedCourse}/${encodedModule}/${encodedFilename}`;
    const subtitleSrc = `${API_BASE}/api/subtitles/${encodedCourse}/${encodedModule}/${encodedSubtitle}`;

    return (
        <div className="video-player-container">
            <div className="video-header">
                <h2>{video.title}</h2>
            </div>
            <video
                ref={videoRef}
                controls
                className="main-video"
                crossOrigin="anonymous"
            >
                <source src={videoSrc} type="video/mp4" />
                {video.hasSubtitles && (
                    <track
                        kind="subtitles"
                        src={subtitleSrc}
                        srcLang="en"
                        label="English"
                        default
                    />
                )}
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default VideoPlayer;
