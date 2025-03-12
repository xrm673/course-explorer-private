import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAlphabeticalSubjects } from '../../firebase/services/subjectService';

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

  // Group subjects by first letter for alphabetical display
  const groupedSubjects = subjects.reduce((acc, subject) => {
    const firstLetter = subject.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(subject);
    return acc;
  }, {});

  return (
    <div className="subject-list-page">
      <h1>Subjects</h1>
      
      {Object.keys(groupedSubjects).sort().map(letter => (
        <div key={letter} className="letter-group">
          <h2 id={`letter-${letter}`}>{letter}</h2>
          <div className="subject-grid">
            {groupedSubjects[letter].map(subject => (
              <Link 
                key={subject.id} 
                to={`/subjects/${subject.id}`} 
                className="subject-card"
              >
                <h3>{subject.id}</h3>
                <p>{subject.name}</p>
                {subject.formalName && <p className="formal-name">{subject.formalName}</p>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}