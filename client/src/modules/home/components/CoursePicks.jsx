import {useState} from 'react'
import HomeCourseCard from "./HomeCourseCard"

export default function CoursePicks() {
    const [course, setCourse] = useState(
        {
            code:"CS1110",
            title:"Introduction to CS"
        }
    )
    return(
        <div>
            <p>Courses you may want to take in Fall 2025</p>
            <div>
                <HomeCourseCard course={course}/>
                <HomeCourseCard course={course}/>
                <HomeCourseCard course={course}/>
                <HomeCourseCard course={course}/>
            </div>
        </div>
    )
}