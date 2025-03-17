import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function ScheduleSidebar({ onClose, activeSemester }) {
    const { user, setUser } = useContext(UserContext);
    // Track which semesters are expanded
    const [expandedSemesters, setExpandedSemesters] = useState({});
    // Local state for scheduleData
    const [scheduleData, setScheduleData] = useState({
        planned: {
            "SP27": [],
            "FA26": [],
            "SP26": [],
            "FA25": [],
        },
        taken: {
            "SP25": [],
            "FA24": [],
            "SP24": [],
            "FA23": [],
            "Ungrouped Courses": []
        }
    });
    
    // Load scheduleData from user context (localStorage)
    useEffect(() => {
        if (user && user.scheduleData) {
            setScheduleData(user.scheduleData);
        }
    }, [user]);
    
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

    // Remove course from both localStorage and database
    const removeCourse = async (courseCode, semester, type) => {
        if (!user || !user.netId) {
            console.error("User not logged in");
            return;
        }

        try {
            // Create a deep copy of the current scheduleData
            const updatedScheduleData = JSON.parse(JSON.stringify(scheduleData));
            
            // Filter out the course to remove
            updatedScheduleData[type][semester] = updatedScheduleData[type][semester]
                .filter(course => course.code !== courseCode);
            
            // Update local state
            setScheduleData(updatedScheduleData);
            
            // Update database
            const userRef = doc(db, 'users', user.netId);
            await updateDoc(userRef, {
                scheduleData: updatedScheduleData,
                lastUpdated: new Date()
            });
            
            // Update user context (which updates localStorage)
            setUser({
                ...user,
                scheduleData: updatedScheduleData
            });
            
            console.log(`Removed ${courseCode} from ${semester}`);
        } catch (error) {
            console.error("Error removing course:", error);
        }
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
                                {courses.length === 0 ? (
                                    <div style={{ padding: "8px", color: "#666", fontStyle: "italic" }}>
                                        No courses planned for this semester
                                    </div>
                                ) : (
                                    courses.map((course, index) => (
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
                                                onClick={() => removeCourse(course.code, semester, 'planned')}
                                                style={{
                                                    "background": "none",
                                                    "border": "none",
                                                    "cursor": "pointer",
                                                    "color": "#dc3545",
                                                    "fontWeight": "bold"
                                                }}
                                            >×</button>
                                        </div>
                                    ))
                                )}
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
                                {courses.length === 0 ? (
                                    <div style={{ padding: "8px", color: "#666", fontStyle: "italic" }}>
                                        No courses for this semester
                                    </div>
                                ) : (
                                    courses.map((course, index) => (
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
                                                {course.code}: {course.tts}
                                            </a>
                                            <button 
                                                onClick={() => removeCourse(course.code, semester, 'taken')}
                                                style={{
                                                    "background": "none",
                                                    "border": "none",
                                                    "cursor": "pointer",
                                                    "color": "#dc3545",
                                                    "fontWeight": "bold"
                                                }}
                                            >×</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}