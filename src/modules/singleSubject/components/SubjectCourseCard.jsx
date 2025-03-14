import { Link } from "react-router"

export default function SubjectCourseCard({course}) {
    return (
        <>
          <Link to={`/courses/${course.id}`}>
            <p>{course.id}</p>
          </Link>
        </>
    )
}