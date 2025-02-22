import { useEffect, useState } from 'react' 
import { getDisplayCourse } from '../services/api'

export default function displayCourse( {courseCode} ) {
   const [course, setCourse] = useState(null);

   useEffect (() => {
    async function fetchDisplayCourse() {
        const data = await getDisplayCourse(courseCode);
        setCourse(data);
    }
    fetchDisplayCourse();
   }, [courseCode]);

   return (
    <>
      <h1>course.course_code</h1>
    </>
   )

}