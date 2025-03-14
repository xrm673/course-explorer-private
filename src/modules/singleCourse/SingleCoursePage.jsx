import { useEffect, useState } from 'react' 
import { useParams } from 'react-router-dom';

import { getCourseById } from '../../firebase/services/courseService';

export default function SingleCoursePage() {
    const [course, setCourse] = useState(null);
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseData = await getCourseById(courseId);
                setCourse(courseData);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching course ${courseId}:`, err);
                setError("Failed to load course data");
                setLoading(false);
            }
        };
        
        fetchCourse();
    }, [courseId]); // Add courseId to dependency array

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!course) return <h1>Course not found</h1>;

    return (
        <>
            <h1>{ course.ttl }</h1>
            <h2>{ course.id }</h2>
            {/* Add more course details as needed */}
        </>
    );
}