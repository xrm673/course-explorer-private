import React, { useContext } from 'react';
import { SidebarContext } from '../core/MainLayout';
import styles from './SemesterSelector.module.css';

export default function SemesterSelector({ selectedSemester, onSemesterChange }) {
  const { activeSidebar } = useContext(SidebarContext);
  const semesters = ["FA25", "SP26", "FA26", "SP27"];
  
  // Use same class as content container for consistent width
  const containerClassName = activeSidebar ? 
    `${styles.selectorContainer} sidebar-open` : 
    styles.selectorContainer;
  
  return (
    <div className={containerClassName}>
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