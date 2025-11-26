import React, { useState } from 'react';

const Sidebar = ({ courses, onSelectModule, selectedModule }) => {
    const [expandedCourses, setExpandedCourses] = useState({});

    const toggleCourse = (courseName) => {
        setExpandedCourses(prev => ({
            ...prev,
            [courseName]: !prev[courseName]
        }));
    };

    return (
        <div className="sidebar">
            <h2>Courses</h2>
            <div className="course-list">
                {courses.map(course => (
                    <div key={course.name} className="course-item">
                        <div
                            className="course-header"
                            onClick={() => toggleCourse(course.name)}
                        >
                            <span className="icon">{expandedCourses[course.name] ? '▼' : '▶'}</span>
                            {course.name}
                        </div>
                        {expandedCourses[course.name] && (
                            <div className="module-list">
                                {course.modules.map(module => (
                                    <div
                                        key={module.name}
                                        className={`module-item ${selectedModule?.path === module.path ? 'active' : ''}`}
                                        onClick={() => onSelectModule(course, module)}
                                    >
                                        {module.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
