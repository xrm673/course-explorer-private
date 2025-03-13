import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCoursesBySubject } from '../../firebase/services/courseService';
import SubjectCourseCard from './components/SubjectCourseCard';

export default function SingleSubjectPage() {
    const { subjectId } = useParams();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const coursesData = await getCoursesBySubject(subjectId);
                setCourses(coursesData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching subjects:", err);
                setError("Failed to load subjects. Please try again later.");
                setLoading(false);
            }
        };
        fetchCourses();
    }, [subjectId]);

    if (loading) return <div>Loading courses for {subjectId}...</div>;
    if (error) return <div>Error: {error}</div>;
    if (courses.length === 0) return <div>No courses found for {subjectId}</div>;

    return (
        <div>
            <h2>{subjectId} Courses</h2>
            <div className="course-grid">
                {courses.map((course) => (
                    <SubjectCourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
}