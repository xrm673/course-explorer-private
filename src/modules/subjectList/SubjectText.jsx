import { Link } from 'react-router-dom';

export default function SubjectText({ subject }) {
  return (
    <div style={{ display: 'flex', marginBottom: '8px' }}>
      <span style={{ width: '90px', flexShrink: 0 }}>{subject.code}</span>
      <Link to={`/subjects/${subject.id}`} style={{ textDecoration: 'none' }}>
        {subject.formalName}
      </Link>
    </div>
  );
}