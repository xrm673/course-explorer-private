import { useState, useRef, useEffect } from 'react';
import styles from './RequirementDescription.module.css';
export const RequirementDescription = ({ descriptions }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!descriptions || descriptions.length === 0) return null;
  
  // Only show the first 2 items when collapsed
  const visibleDescriptions = isExpanded ? 
    descriptions : 
    (descriptions.length > 2 ? [descriptions[0], descriptions[1]] : descriptions);
  
  return (
    <div className={styles.requirementDescription}>
      <ul className={styles.descriptionList}>
        {visibleDescriptions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      
      {descriptions.length > 2 && (
        <button 
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Show less' : `Show more...`}
        </button>
      )}
    </div>
  );
};