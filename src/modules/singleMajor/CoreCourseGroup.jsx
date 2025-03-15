import CoreCourseCard from "./CoreCourseCard"

export default function CoreCourseGroup ({courseGrp}) {
    return (
        <div style={{}}>
            {
                courseGrp.courses.map((courseId, i) => (
                    <CoreCourseCard key={i} courseId={courseId}/>
                ))
            }
        </div>
    )
}