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

    if (loading) return <div style={{"width": "100%", "padding": "20px", "textAlign": "center"}}>Loading...</div>;
    if (error) return <div style={{"width": "100%", "padding": "20px", "textAlign": "center", "color": "#e53935"}}>{error}</div>;

    const tags = ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"]

    return (
        <div style={{
            "border": "1px solid #ddd",
            "borderRadius": "8px",
            "width": "70%",
            "marginBottom": "16px",
            "padding": "16px",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.05)",
            "display": "flex",
            "flexDirection": "column"
        }}>
            {/* Header Section */}
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "flex-start",
                "marginBottom": "12px",
                "width": "100%"
            }}>
                {/* Course Info */}
                <div style={{
                    "flex": "1"
                }}>
                    <div style={{
                        "display": "flex",
                        "alignItems": "center",
                        "marginBottom": "8px"
                    }}>
                        <p style={{
                            "fontWeight": "bold",
                            "fontSize": "16px",
                            "margin": "0",
                            "marginRight": "16px"
                        }}>
                            {course.id}
                        </p>
                        {/* Review Score */}
                        <div style={{
                            "display": "flex",
                            "alignItems": "center",
                            "fontSize": "14px",
                            "backgroundColor": "#f5f5f5",
                            "padding": "2px 8px",
                            "borderRadius": "12px"
                        }}>
                            <span style={{
                                "fontWeight": "bold",
                                "marginRight": "4px"
                            }}>
                                4.2
                            </span>
                            <span style={{
                                "color": "#666",
                                "fontSize": "12px"
                            }}>
                                Rating
                            </span>
                        </div>
                    </div>
                    <h3 style={{
                        "fontSize": "20px",
                        "margin": "0",
                        "lineHeight": "1.3",
                        "fontWeight": "500"
                    }}>
                        <Link to={`/courses/${course.id}`}>
                            {course.ttl}
                        </Link>
                    </h3>
                </div>

                {/* Action Buttons */}
                <div style={{
                    "display": "flex",
                    "gap": "8px",
                    "marginLeft": "16px"
                }}>
                    <img 
                        src={add} 
                        alt="Add the course to my schedule" 
                        style={{
                            "width": "40px",
                            "cursor": "pointer"
                        }}
                    />
                    <img 
                        src={checkMark} 
                        alt="Have taken this course" 
                        style={{
                            "width": "30px",
                            "cursor": "pointer",
                            "marginTop": "5px" // Align with the larger plus button
                        }}
                    />
                </div>
            </div>

            {/* Tags Section */}
            <div style={{
                "display": "flex",
                "gap": "8px",
                "flexWrap": "wrap"
            }}>
                {tags.map((tag, index) => (
                    <span key={index} style={{
                        "padding": "4px 10px",
                        "border": "1px solid #ddd",
                        "borderRadius": "16px",
                        "fontSize": "18px",
                        "backgroundColor": "#f9f9f9"
                    }}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}