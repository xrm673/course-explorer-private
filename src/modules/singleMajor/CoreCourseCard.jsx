import { useEffect, useState } from "react"
import { Link } from "react-router"
import { getCourseById } from "../../firebase/services/courseService"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"

export default function CoreCourseCard({ courseId }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseData = await getCourseById(courseId)
                setCourse(courseData)
                setLoading(false)
            } catch (err) {
                setError("Failed to load")
                setLoading(false)
            }
        } 
        fetchCourse()
    }, [courseId])

    if (loading) return <div style={{"width": "100%", "padding": "20px", "textAlign": "center", "backgroundColor": "white"}}>Loading...</div>;
    if (error) return <div style={{"width": "100%", "padding": "20px", "textAlign": "center", "color": "#e53935", "backgroundColor": "white"}}>{error}</div>;

    const tags = ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"]

    return (
        <div style={{
            "border": "1px solid #ddd",
            "borderRadius": "8px",
            "width": "calc(100% - 2px)", // Accounting for border
            "boxSizing": "border-box", // This is crucial - includes padding in width calculation
            "marginBottom": "12px",
            "padding": "12px", // Further reduced padding
            "boxShadow": "0 2px 4px rgba(0,0,0,0.05)",
            "display": "flex",
            "flexDirection": "column",
            "backgroundColor": "white",
            "maxWidth": "100%", // Ensures the card doesn't exceed parent width
            "minHeight": "115px" // Add minimum height to accommodate two lines of title
        }}>
            {/* Header Section */}
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "flex-start",
                "marginBottom": "10px",
                "width": "100%"
            }}>
                {/* Course Info */}
                <div style={{
                    "flex": "1",
                    "minWidth": "0", // Important for text overflow handling
                    "maxWidth": "calc(100% - 50px)" // Leave space for buttons
                }}>
                    <div style={{
                        "display": "flex",
                        "alignItems": "center",
                        "marginBottom": "6px"
                    }}>
                        <p style={{
                            "fontWeight": "bold",
                            "fontSize": "15px",
                            "margin": "0",
                            "marginRight": "12px"
                        }}>
                            {course.id}
                        </p>
                        {/* Review Score */}
                        <div style={{
                            "display": "flex",
                            "alignItems": "center",
                            "fontSize": "13px",
                            "backgroundColor": "#f5f5f5",
                            "padding": "2px 6px",
                            "borderRadius": "12px"
                        }}>
                            <span style={{
                                "fontWeight": "bold",
                                "marginRight": "3px"
                            }}>
                                4.2
                            </span>
                            <span style={{
                                "color": "#666",
                                "fontSize": "11px"
                            }}>
                                Rating
                            </span>
                        </div>
                    </div>
                    <Link to={`/courses/${course.id}`} 
                          style={{
                            "fontSize": "20px", // Reduced font size
                            "color": "#333",
                            "textDecoration": "none",
                            "margin": "0",
                            "lineHeight": "1.3",
                            "fontWeight": "500",
                            "display": "-webkit-box",
                            "WebkitLineClamp": "2", // Show max 2 lines
                            "WebkitBoxOrient": "vertical",
                            "overflow": "hidden",
                            "maxWidth": "100%" // Ensure text doesn't overflow
                    }}>
                            {course.ttl}
                    </Link>
                </div>

                {/* Action Buttons */}
                <div style={{
                    "display": "flex",
                    "gap": "5px",
                    "marginLeft": "10px",
                    "flexShrink": "0"
                }}>
                    <img 
                        src={add} 
                        alt="Add the course to my schedule" 
                        style={{
                            "width": "36px",
                            "cursor": "pointer"
                        }}
                    />
                    <img 
                        src={checkMark} 
                        alt="Have taken this course" 
                        style={{
                            "width": "28px",
                            "cursor": "pointer",
                            "marginTop": "4px"
                        }}
                    />
                </div>
            </div>

            {/* Tags Section */}
            <div style={{
                "display": "flex",
                "gap": "6px",
                "flexWrap": "wrap"
            }}>
                {tags.map((tag, index) => (
                    <span key={index} style={{
                        "padding": "3px 8px",
                        "border": "1px solid #ddd",
                        "borderRadius": "16px",
                        "fontSize": "17px",
                        "backgroundColor": "#f9f9f9"
                    }}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}