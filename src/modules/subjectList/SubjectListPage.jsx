import { useState, useEffect } from 'react';
import { getAlphabeticalSubjects } from '../../firebase/services/subjectService';
import SubjectText from './SubjectText';

export default function SubjectListPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsData = await getAlphabeticalSubjects();
        setSubjects(subjectsData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching subjects:", err);
        setError("Failed to load subjects. Please try again later.");
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  if (loading) return <div>Loading subjects...</div>;
  if (error) return <div>Error: {error}</div>;

  // Split subjects into two arrays for two columns
  const halfwayPoint = Math.ceil(subjects.length / 2);
  const leftColumnSubjects = subjects.slice(0, halfwayPoint);
  const rightColumnSubjects = subjects.slice(halfwayPoint);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Subjects</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Left column */}
        {leftColumnSubjects.map((subject, i) => (
          <SubjectText key={`left-${i}`} subject={subject} />
        ))}
        
        {/* Right column */}
        {rightColumnSubjects.map((subject, i) => (
          <SubjectText key={`right-${i}`} subject={subject} />
        ))}
      </div>
    </div>
  );
}