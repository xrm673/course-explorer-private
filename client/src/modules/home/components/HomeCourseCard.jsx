export default function HomeCourseCard({ course=null }) {
    return (
        <div>
            <p>{course.code}</p>
            <p>{course.title}</p>
        </div>
    )
}