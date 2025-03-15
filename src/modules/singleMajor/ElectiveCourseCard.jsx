import { useEffect, useState } from "react"
import { Link } from "react-router"
import { getCourseById } from "../../firebase/services/courseService"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"

export default function ElectiveCourseCard({ courseId }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect (() => {
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
    }, [courseId]) // Added courseId as dependency

    if (loading) return <div style={{"width": "100%", "padding": "12px", "textAlign": "center", "backgroundColor": "white"}}>Loading...</div>;
    if (error) return <div style={{"width": "100%", "padding": "12px", "textAlign": "center", "color": "#e53935", "backgroundColor": "white"}}>{error}</div>;

    const tags = ["Tag 1", "Tag 2", "Tag 3"]

    return(
      <div style={{
        "border": "1px solid #ddd",
        "borderRadius": "8px",
        "width": "100%", // Changed from fixed 400px to 100%
        "maxWidth": "100%", // Ensure it doesn't exceed its container
        "padding": "12px", // Reduced padding from 16px
        "boxSizing": "border-box", // Includes padding in width calculation
        "boxShadow": "0 2px 4px rgba(0,0,0,0.05)",
        "display": "flex",
        "flexDirection": "column",
        "position": "relative",
        "backgroundColor": "white"
      }}>
        {/* Header Section */}
        <div style={{
          "display": "flex",
          "justifyContent": "space-between",
          "alignItems": "flex-start",
          "marginBottom": "6px" // Reduced from 8px
        }}>
          {/* Course Info */}
          <div style={{
            "flex": "1",
            "minWidth": "0", // Important for text overflow handling
            "maxWidth": "calc(100% - 50px)" // Leave space for buttons
          }}>
            <p style={{
              "fontWeight": "bold",
              "fontSize": "15px", // Reduced from 16px
              "margin": "0 0 3px 0" // Reduced from 4px
            }}>
              {course.id}
            </p>
            <h3 style={{
              "fontSize": "18px", // Reduced from 20px
              "margin": "0 0 6px 0", // Reduced from 8px
              "lineHeight": "1.3",
              "display": "-webkit-box",
              "WebkitLineClamp": "2", // Show max 2 lines
              "WebkitBoxOrient": "vertical",
              "overflow": "hidden"
            }}>
                <Link 
                  to={`/courses/${course.id}`}
                  style={{
                    "color": "#333", // Darker text color instead of default blue
                    "textDecoration": "none", // Remove underline
                    "fontWeight": "500", // Slightly bolder than normal
                    "transition": "color 0.2s ease",
                    ":hover": { // This won't work directly in inline styles, but showing intent
                      "color": "#4a82e3", // Light blue on hover
                      "textDecoration": "underline" // Add underline on hover
                    }
                  }}
                  className="course-title-link" // Add class for potential CSS styling in stylesheet
                >
                  {course.ttl}
                </Link>
            </h3>
          </div>
  
          {/* Action Buttons */}
          <div style={{
            "display": "flex",
            "gap": "5px", // Reduced from 8px
            "flexShrink": "0" // Prevent buttons from shrinking
          }}>
            <img 
              src={add} 
              alt="Add the course to my schedule" 
              style={{
                "width": "32px", // Reduced from 40px
                "cursor": "pointer"
              }}
            />
            <img 
              src={checkMark} 
              alt="Have taken this course" 
              style={{
                "width": "24px", // Reduced from 30px
                "cursor": "pointer",
                "marginTop": "4px" // Reduced from 5px
              }}
            />
          </div>
        </div>
  
        {/* Tags Section */}
        <div style={{
          "display": "flex",
          "gap": "6px", // Reduced from 8px
          "marginBottom": "8px", // Reduced from 12px
          "flexWrap": "wrap"
        }}> 
          {tags.map((tag, i) => (
            <span 
              key={i}
              style={{
                "padding": "3px 6px", // Reduced from 4px 8px
                "border": "1px solid #ddd",
                "borderRadius": "14px", // Reduced from 16px
                "fontSize": "16px", // Reduced from 16px
                "backgroundColor": "#f8f8f8" // Light background for better visibility
              }}
            >
              {tag}
            </span>
          ))}
        </div>
  
        {/* Review Score */}
        <div style={{
          "display": "flex",
          "alignItems": "center",
          "fontSize": "14px" // Consistent size
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
            Course Rating
          </span>
        </div>
      </div>
    );
}