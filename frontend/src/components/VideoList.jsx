import React from 'react';

const VideoList = ({ module, onSelectVideo, selectedVideo }) => {
    if (!module) {
        return <div className="video-list-placeholder">Select a module to view videos</div>;
    }

    return (
        <div className="video-list-panel">
            <h3>{module.name}</h3>
            <div className="video-items">
                {module.videos.map(video => (
                    <div
                        key={video.filename}
                        className={`video-item ${selectedVideo?.filename === video.filename ? 'active' : ''}`}
                        onClick={() => onSelectVideo(video)}
                    >
                        <span className="play-icon">▶</span>
                        <span className="video-title">{video.title}</span>
                        {video.hasSubtitles && <span className="cc-badge" title="Subtitles available">CC</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoList;
