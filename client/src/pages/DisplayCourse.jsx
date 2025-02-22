import { useEffect, useState } from 'react' 
import { getDisplayCourse } from '../services/api'
import { useParams } from 'react-router';

export default function DisplayCourse() {
   const [course, setCourse] = useState(null);
   const { courseCode } = useParams();
   const [loading, setLoading] = useState(true);

   useEffect (() => {
    async function fetchDisplayCourse() {
        try {
            const data = await getDisplayCourse(courseCode);
            setCourse(data);
        } catch (error) {
            console.error("Failed to fetch course data", error);
        } finally {
            setLoading(false);
        }
    }
    fetchDisplayCourse();
   }, [courseCode]);

   if (loading) return <h1>Loading...</h1>;
   if (!course) return <h1>Course not found</h1>;

   return (
    <>
      <h1>{ course.course_code }</h1>
    </>
   )

}