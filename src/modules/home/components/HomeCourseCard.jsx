import React, { useState } from 'react';

export default function HomeCourseCard({ 
  course, 
  onPlan, 
  onTaken, 
  onRemove, 
  initialState = 'normal' 
}) {
  // States: 'normal', 'planned', 'taken', 'ineligible'
  const [state, setState] = useState(initialState);
  
  // Handle planning a course
  const handlePlan = (e) => {
    e.stopPropagation();
    setState('planned');
    if (onPlan) onPlan(course);
  };
  
  // Handle marking a course as taken
  const handleTaken = (e) => {
    e.stopPropagation();
    setState('taken');
    if (onTaken) onTaken(course);
  };
  
  // Handle removing a course
  const handleRemove = (e) => {
    e.stopPropagation();
    setState('normal');
    if (onRemove) onRemove(course);
  };
  
  // Navigate to course page
  const handleCardClick = () => {
    // In real implementation, this would navigate to the course page
    console.log(`Navigating to course page for ${course.code}`);
  };
  
  // Determine card styles based on state
  const getCardStyles = () => {
    const baseStyles = {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative',
      border: '1px solid #e5e7eb'
    };
    
    switch (state) {
      case 'planned':
        return {
          ...baseStyles,
          border: '1px solid #3b82f6',
          backgroundColor: '#eff6ff'
        };
      case 'taken':
        return {
          ...baseStyles,
          border: '1px solid #10b981',
          backgroundColor: '#ecfdf5'
        };
      case 'ineligible':
        return {
          ...baseStyles,
          border: '1px solid #ef4444',
          backgroundColor: '#fef2f2'
        };
      default:
        return baseStyles;
    }
  };
  
  // Styles for tags
  const tagStyles = {
    display: 'inline-block',
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    margin: '0 4px 4px 0'
  };
  
  const moreTagStyles = {
    ...tagStyles,
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    cursor: 'pointer'
  };
  
  const tagsContainerStyles = {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: '12px'
  };
  
  // Styles for action buttons
  const planButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    backgroundColor: '#3b82f6', // blue
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    marginRight: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
  
  const takenButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: '#10b981', // green
    color: 'white',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
  
  const removeButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: 'white',
    color: '#6b7280',
    borderRadius: '50%',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    fontSize: '20px'
  };
  
  const actionContainerStyles = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    display: 'flex'
  };
  
  const warningIconStyles = {
    position: 'absolute',
    top: '12px',
    left: '12px',
    color: '#ef4444', // red
    fontSize: '18px'
  };
  
  const tooltipContainerStyles = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    pointerEvents: 'none'
  };
  
  const tooltipStyles = {
    backgroundColor: 'white',
    padding: '12px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    maxWidth: '200px',
    zIndex: 10,
    border: '1px solid #fca5a5' // light red
  };
  
  const courseCodeStyles = {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#1f2937',
    marginBottom: '4px'
  };
  
  const courseTitleStyles = {
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  };

  return (
    <div 
      style={getCardStyles()}
      onClick={handleCardClick}
    >
      <div>
        {/* Course code and title */}
        <div>
          <h3 style={courseCodeStyles}>{course.code}</h3>
          <p style={courseTitleStyles}>{course.title}</p>
        </div>
        
        {/* Tags */}
        <div style={tagsContainerStyles}>
          {course.tags.slice(0, 3).map((tag, index) => (
            <span key={index} style={tagStyles}>
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span style={moreTagStyles}>
              +{course.tags.length - 3} more
            </span>
          )}
        </div>
        
        {/* Action buttons */}
        <div style={actionContainerStyles}>
          {state === 'planned' || state === 'taken' ? (
            <button 
              onClick={handleRemove}
              style={removeButtonStyles}
              aria-label="Remove course"
            >
              ×
            </button>
          ) : (
            <>
              <button
                onClick={handlePlan}
                style={planButtonStyles}
                aria-label="Plan for future semester"
              >
                +
              </button>
              <button
                onClick={handleTaken}
                style={takenButtonStyles}
                aria-label="Mark as taken"
              >
                ✓
              </button>
            </>
          )}
        </div>
        
        {/* Ineligible warning icon and tooltip */}
        {state === 'ineligible' && (
          <>
            <div style={warningIconStyles}>⚠️</div>
            <div 
              style={{
                ...tooltipContainerStyles,
                opacity: 0
              }}
              className="tooltip-container"
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = 1;
                e.currentTarget.style.pointerEvents = 'auto';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = 0;
                e.currentTarget.style.pointerEvents = 'none';
              }}
            >
              <div style={tooltipStyles}>
                <p style={{ fontWeight: 'bold', color: '#ef4444', marginBottom: '4px' }}>Ineligible:</p>
                <p style={{ color: '#4b5563' }}>{course.ineligibleReason}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}