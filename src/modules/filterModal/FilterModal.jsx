import React, { useState, useEffect } from 'react';
import styles from './FilterModal.module.css';
import FilterCategory from "./FilterCategory"

export default function FilterModal(
  { isOpen, filters, categoryNames, onClose, onApplyFilters }){

  // Initialize local state (will be empty initially)
  const [localFilters, setLocalFilters] = useState({});

  // Safe handlers with fallbacks
  const handleClose = onClose || (() => {});
  const handleApplyExternal = onApplyFilters || (() => {});
  
  // Sync local state with parent state when modal opens or filters change
  useEffect(() => {
    if (filters && isOpen) {
      // Deep clone to avoid reference issues
      setLocalFilters(JSON.parse(JSON.stringify(filters)));
    }
  }, [filters, isOpen]);

  // Handle checkbox changes
  const handleCheckboxChange = (category, option, checkboxType) => {
    setLocalFilters(prevFilters => {
      // Create a deep copy of the relevant category
      const updatedCategory = JSON.parse(JSON.stringify(prevFilters[category]));
      
      // For "only" checkboxes, uncheck all other "only" options
      if (checkboxType === 'only' && !updatedCategory[option][checkboxType]) {
        updatedCategory[option].prefer = false
      } else if (checkboxType === 'prefer' && !updatedCategory[option][checkboxType]) {
        updatedCategory[option].only = false
      }
      
      // Toggle the specific checkbox
      updatedCategory[option][checkboxType] = !updatedCategory[option][checkboxType];
      
      // Return new state with updated category
      return {
        ...prevFilters,
        [category]: updatedCategory
      };
    });
  };

  const handleApply = () => {
    // Return the full filters including metadata
    // The MajorRequirement component only cares about the checkbox states
    handleApplyExternal(localFilters);
    handleClose();
  };

  const handleReset = () => {
    // Reset to the original filters from parent
    if (filters) {
      setLocalFilters(JSON.parse(JSON.stringify(filters)));
    }
  };

  // Early return if modal is not open
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Filter Courses</h2>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Render all categories dynamically */}
          {Object.entries(localFilters).map(([category, categoryData]) => {
            // Skip rendering categories with no options
            if (Object.keys(categoryData).length === 0) return null;
            
            return (
              <FilterCategory
                key={category}
                categoryKey={category}
                categoryData={categoryData}
                title={categoryNames[category] || category}
                onCheckboxChange={handleCheckboxChange}
              />
            );
          })}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.resetButton} onClick={handleReset}>Reset</button>
          <button className={styles.applyButton} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};