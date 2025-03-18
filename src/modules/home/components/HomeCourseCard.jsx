import React from 'react';
import { Link } from 'react-router-dom';
import add from '../../../assets/add.svg';
import checkMark from '../../../assets/checkMark.svg';
import styles from './HomeCourseCard.module.css';

/**
 * A course card component for displaying course recommendations on the home page
 * Follows the style of ElectiveCourseCard component
 * 
 * @param {Object} course - The course object with data
 * @param {Array} tags - Array of tags to display for the course
 * @param {Object} status - Object with isTaken and isPlanned properties
 * @param {Function} onAddCourse - Handler for adding course to schedule
 * @param {Function} onMarkAsTaken - Handler for marking course as taken
 * @param {Function} onRemoveCourse - Handler for removing course from schedule
 * @param {string} rating - Optional course rating to display
 */
const HomeCourseCard = ({ 
  course, 
  tags = [], 
  status = { isPlanned: false, isTaken: false }, 
  onAddCourse, 
  onMarkAsTaken, 
  onRemoveCourse,
  rating
}) => {
  
  // Determine card class based on status
  let cardClassName = styles.courseCard;
  if (status.isTaken) {
    cardClassName = `${cardClassName} ${styles.takenCourse}`;
  } else if (status.isPlanned) {
    cardClassName = `${cardClassName} ${styles.plannedCourse}`;
  }
  
  // Prevent event bubbling for action button clicks
  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddCourse) onAddCourse(course);
  };
  
  const handleTakenClick = (e) => {
    e.stopPropagation();
    if (onMarkAsTaken) onMarkAsTaken(course);
  };
  
  const handleRemoveClick = (e) => {
    e.stopPropagation();
    if (onRemoveCourse) onRemoveCourse(course);
  };
  
  return (
    <div className={cardClassName}>
      {/* Header Section */}
      <div className={styles.header}>
        {/* Course Info */}
        <div className={styles.courseInfo}>
          <p className={styles.courseCode}>
            {course.id}
          </p>
          <h3 className={styles.courseTitle}>
            <Link 
              to={`/courses/${course.id}`}
              className={styles.courseTitleLink}
            >
              {course.ttl}
            </Link>
          </h3>
        </div>
      
        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          {status.isPlanned || status.isTaken ? (
            <button 
              className={styles.removeButton}
              onClick={handleRemoveClick}
              aria-label="Remove course from schedule"
            >
              ×
            </button>
          ) : (
            <>
              <img 
                src={add} 
                alt="Add the course to my schedule" 
                className={styles.addButton}
                onClick={handleAddClick}
              />
              <img 
                src={checkMark} 
                alt="Have taken this course" 
                className={styles.checkButton}
                onClick={handleTakenClick}
              />
            </>
          )}
        </div>
      </div>
      
      {/* Tags Section */}
      {tags.length > 0 && (
        <div className={styles.tagsContainer}> 
          {tags.map((tag, i) => (
            <span 
              key={i}
              className={styles.tag}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Review Score */}
      {rating && (
        <div className={styles.reviewScore}>
          <span className={styles.score}>
            {rating}
          </span>
          <span className={styles.ratingLabel}>
            Course Rating
          </span>
        </div>
      )}
    </div>
  );
};

export default HomeCourseCard;