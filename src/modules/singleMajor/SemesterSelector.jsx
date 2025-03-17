import React from 'react';
import styles from './SemesterSelector.module.css';

export default function SemesterSelector({ selectedSemester, onSemesterChange }) {
  const semesters = ["FA25", "SP26", "FA26", "SP27"];
  
  return (
    <div className={styles.selectorContainer}>
      <h2 className={styles.selectorTitle}>Planning For:</h2>
      <div className={styles.buttonsContainer}>
        {semesters.map((semester) => (
          <button
            key={semester}
            onClick={() => onSemesterChange(semester)}
            className={`${styles.semesterButton} ${selectedSemester === semester ? styles.activeButton : ''}`}
          >
            {semester}
          </button>
        ))}
      </div>
    </div>
  );
}