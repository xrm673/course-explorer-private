import { useState, useEffect } from 'react';
import { getMajorById } from "../../firebase/services/majorService";

import { Link } from 'react-router';

export default function MajorText({ majorCode }) {
  const [major, setMajor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMajor = async () => {
      try {
        const majorData = await getMajorById(majorCode);
        setMajor(majorData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching major ${majorCode}:`, err);
        setError(`Failed to load major data.`);
        setLoading(false);
      }
    };
    
    fetchMajor();
  }, [majorCode]);
  
  if (error) return <div>Error: {error}</div>;
  if (!major) return <div>No major data found</div>;
  
  return (
    <div style={{ display: 'flex', marginBottom: '8px' }}>
      <span style={{ width: '90px', flexShrink: 0 }}>{major.id}</span>
      <Link to={`/majors/${major.id}`} style={{ textDecoration: 'none' }}>
        {major.name}
      </Link>
    </div>
  );
}