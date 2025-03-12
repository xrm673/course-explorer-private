import { useState, useEffect } from 'react';

export default function ScheduleSidebar({ onClose, activeSemester, scheduleData, onRemoveCourse }) {
    // Track which semesters are expanded
    const [expandedSemesters, setExpandedSemesters] = useState({});
    
    // When activeSemester changes, expand that semester
    useEffect(() => {
        if (activeSemester) {
            setExpandedSemesters(prev => ({
                ...prev,
                [activeSemester]: true
            }));
        }
    }, [activeSemester]);
    
    // Toggle semester expansion
    const toggleSemester = (semester) => {
        setExpandedSemesters(prev => ({
            ...prev,
            [semester]: !prev[semester]
        }));
    };

    return (
        <div style={{
            "position": "fixed",
            "right": 0,
            "top": "100px",
            "height": "calc(100vh - 100px)",
            "width": "300px",
            "backgroundColor": "white",
            "boxShadow": "-2px 0 5px rgba(0,0,0,0.1)",
            "zIndex": 90,
            "padding": "20px",
            "overflow": "auto"
        }}>
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "center",
                "marginBottom": "20px"
            }}>
                <h2 style={{ "margin": 0 }}>My Schedule</h2>
                <button 
                    onClick={onClose}
                    style={{
                        "background": "none",
                        "border": "none",
                        "fontSize": "24px",
                        "cursor": "pointer"
                    }}
                >
                    ×
                </button>
            </div>
            
            <div style={{ "marginBottom": "30px" }}>
                <h3 style={{ 
                    "backgroundColor": "#e9f5ff", 
                    "padding": "10px", 
                    "borderRadius": "4px",
                    "margin": "0 0 15px 0"
                }}>Plan</h3>
                
                {Object.entries(scheduleData.planned).map(([semester, courses]) => (
                    <div key={semester} style={{ "marginBottom": "15px" }}>
                        <div 
                            onClick={() => toggleSemester(semester)}
                            style={{ 
                                "fontWeight": "bold", 
                                "marginBottom": "8px", 
                                "display": "flex",
                                "justifyContent": "space-between",
                                "alignItems": "center",
                                "cursor": "pointer",
                                "padding": "5px",
                                "backgroundColor": activeSemester === semester ? "#f0f7ff" : "transparent",
                                "borderRadius": "4px"
                            }}
                        >
                            <span>{semester}</span>
                            <span>{expandedSemesters[semester] ? "▲" : "▼"}</span>
                        </div>
                        {expandedSemesters[semester] && (
                            <div>
                                {courses.map((course, index) => (
                                    <div key={index} style={{ 
                                        "display": "flex", 
                                        "justifyContent": "space-between", 
                                        "alignItems": "center",
                                        "padding": "8px",
                                        "backgroundColor": "#f8f9fa",
                                        "borderRadius": "4px",
                                        "marginBottom": "5px"
                                    }}>
                                        <a href={`/course/${course.code.replace(/\s+/g, '')}`} style={{ 
                                            "textDecoration": "none", 
                                            "color": "#333",
                                            "fontWeight": "500"
                                        }}>
                                            {course.code}: {course.title}
                                        </a>
                                        <button 
                                            onClick={() => onRemoveCourse(course.code)}
                                            style={{
                                                "background": "none",
                                                "border": "none",
                                                "cursor": "pointer",
                                                "color": "#dc3545",
                                                "fontWeight": "bold"
                                            }}
                                        >×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div>
                <h3 style={{ 
                    "backgroundColor": "#f0f0f0", 
                    "padding": "10px", 
                    "borderRadius": "4px",
                    "margin": "0 0 15px 0"
                }}>Taken</h3>
                
                {Object.entries(scheduleData.taken).map(([semester, courses]) => (
                    <div key={semester} style={{ "marginBottom": "15px" }}>
                        <div 
                            onClick={() => toggleSemester(semester)}
                            style={{ 
                                "fontWeight": "bold", 
                                "marginBottom": "8px", 
                                "display": "flex",
                                "justifyContent": "space-between",
                                "alignItems": "center",
                                "cursor": "pointer"
                            }}
                        >
                            <span>{semester}</span>
                            <span>{expandedSemesters[semester] ? "▲" : "▼"}</span>
                        </div>
                        {expandedSemesters[semester] && (
                            <div>
                                {courses.map((course, index) => (
                                    <div key={index} style={{ 
                                        "display": "flex", 
                                        "justifyContent": "space-between", 
                                        "alignItems": "center",
                                        "padding": "8px",
                                        "backgroundColor": "#f8f9fa",
                                        "borderRadius": "4px",
                                        "marginBottom": "5px"
                                    }}>
                                        <a href={`/course/${course.code.replace(/\s+/g, '')}`} style={{ 
                                            "textDecoration": "none", 
                                            "color": "#333",
                                            "fontWeight": "500"
                                        }}>
                                            {course.code}: {course.title}
                                        </a>
                                        <button style={{
                                            "background": "none",
                                            "border": "none",
                                            "cursor": "pointer",
                                            "color": "#dc3545",
                                            "fontWeight": "bold"
                                        }}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}