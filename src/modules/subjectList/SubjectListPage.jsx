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

  return (
    <>
      <h2>Subjects</h2>
      {
        subjects.map((subject,i) => (
          <SubjectText key={i} subject={subject} />
      ))}
    </>
  );
}