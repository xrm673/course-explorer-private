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
                setError("Faled to load")
                setLoading(false)
            }
        } 
        fetchCourse()
    }, [])

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;

    return(
      <div style={{
        "border": "1px solid #ddd",
        "borderRadius": "8px",
        "width": "400px",
        "padding": "16px",
        "boxShadow": "0 2px 4px rgba(0,0,0,0.05)",
        "display": "flex",
        "flexDirection": "column",
        "position": "relative"
      }}>
        {/* Header Section */}
        <div style={{
          "display": "flex",
          "justifyContent": "space-between",
          "alignItems": "flex-start",
          "marginBottom": "8px"
        }}>
          {/* Course Info */}
          <div>
            <p style={{
              "fontWeight": "bold",
              "fontSize": "16px",
              "margin": "0 0 4px 0"
            }}>
              {course.id}
            </p>
            <h3 style={{
              "fontSize": "20px",
              "margin": "0 0 8px 0",
              "lineHeight": "1.3"
            }}>
                <Link to={`/courses/${course.id}`}>
                  {course.ttl}
                </Link>
            </h3>
          </div>
  
          {/* Action Buttons */}
          <div style={{
            "display": "flex",
            "gap": "8px"
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
          "marginBottom": "12px",
          "flexWrap": "wrap"
        }}>
          <span style={{
            "padding": "4px 8px",
            "border": "1px solid #ddd",
            "borderRadius": "16px",
            "fontSize": "18px"
          }}>
            Tag 1
          </span>
          <span style={{
            "padding": "4px 8px",
            "border": "1px solid #ddd",
            "borderRadius": "16px",
            "fontSize": "18px"
          }}>
            Tag 2
          </span>
          <span style={{
            "padding": "4px 8px",
            "border": "1px solid #ddd",
            "borderRadius": "16px",
            "fontSize": "18px"
          }}>
            Tag 3
          </span>
        </div>
  
        {/* Review Score */}
        <div style={{
          "display": "flex",
          "alignItems": "center",
          "fontSize": "14px"
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