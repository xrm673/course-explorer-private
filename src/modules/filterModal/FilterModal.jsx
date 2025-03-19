import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import styles from './FilterModal.module.css';

/**
 * FilterModal component for filtering courses
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Object} activeFilters - The current active filters
 * @param {Function} onClose - Function to call when closing the modal
 * @param {Function} onApplyFilters - Function to call when applying filters
 */
const FilterModal = ({ 
  isOpen, 
  activeFilters,
  onClose,
  onApplyFilters
}) => {
  const { user } = useContext(UserContext);
  const { academicData } = useAcademic();
  
  // Safe handlers with fallbacks
  const handleClose = onClose || (() => {});
  const handleApplyExternal = onApplyFilters || (() => {});
  
  // Initialize filter state with default structure
  const [filters, setFilters] = useState({
    level: {
      1000: { only: false, prefer: false },
      2000: { only: false, prefer: false },
      3000: { only: false, prefer: false },
      4000: { only: false, prefer: false },
      5000: { only: false, prefer: false }
    },
    enrollment: {
      eligible: { only: false, prefer: false },
    },
    collegeDistributions: {
      "ETM-AS": {only: false, prefer: true},
      "GLC-AS": {only: false, prefer: true},
      "PHS-AS": {only: false, prefer: true},
      "SCD-AS": {only: false, prefer: true}
    },
    // Major requirements will be populated dynamically
    majorRequirements: {}
  });

  // Process requirements for all user's majors when modal opens
  useEffect(() => {
    if (!isOpen || !user?.majors || !academicData?.majors || !academicData?.requirements) {
      return;
    }

    const majorRequirements = {};

    // Process each major the user has selected
    user.majors.forEach(userMajor => {
      const majorId = userMajor.id;
      const collegeId = userMajor.collegeId;
      const majorData = academicData.majors[majorId];
      
      if (!majorData) return;
      
      // Get basic requirements for this major + college combination
      const basicReqs = majorData.basicRequirements?.find(req => 
        req.college === collegeId
      )?.requirements || [];
      
      // Process basic requirements
      basicReqs.forEach(reqId => {
        const requirement = academicData.requirements[reqId];
        if (requirement) {
          // Use reqId directly as the key since it already includes the major prefix
          majorRequirements[reqId] = { 
            only: activeFilters?.majorRequirements?.[reqId]?.only || false, 
            prefer: activeFilters?.majorRequirements?.[reqId]?.prefer || false,
            // Use the requirement's name instead of ID
            displayName: requirement.name || reqId,
            majorId, // Store majorId to group by major in UI
            majorName: majorData.name || majorId
          };
        }
      });
      
      // Process concentration requirements (if any)
      const userConcentrations = userMajor.concentrations || [];
      
      if (userConcentrations.length > 0 && majorData.concentrations) {
        userConcentrations.forEach(concentrationName => {
          const concentrationData = majorData.concentrations.find(
            c => c.concentration === concentrationName
          );
          
          if (concentrationData && concentrationData.requirements) {
            concentrationData.requirements.forEach(reqId => {
              const requirement = academicData.requirements[reqId];
              if (requirement) {
                majorRequirements[reqId] = { 
                  only: activeFilters?.majorRequirements?.[reqId]?.only || false, 
                  prefer: activeFilters?.majorRequirements?.[reqId]?.prefer || false,
                  displayName: requirement.name || reqId,
                  majorId,
                  majorName: majorData.name || majorId,
                  concentrationName // Include concentration name for better organization
                };
              }
            });
          }
        });
      }
    });
    
    // Update filter state with the processed requirements
    setFilters(prev => ({
      ...prev,
      majorRequirements: majorRequirements
    }));
  }, [user, academicData, activeFilters, isOpen]); // Added isOpen to dependencies

  // Merge any active filters when they change
  useEffect(() => {
    if (activeFilters) {
      setFilters(prev => ({
        ...prev,
        level: { ...prev.level, ...(activeFilters.level || {}) },
        enrollment: { ...prev.enrollment, ...(activeFilters.enrollment || {}) },
        instructionMode: { ...prev.instructionMode, ...(activeFilters.instructionMode || {}) },
        collegeDistributions: { ...prev.collegeDistributions, ...(activeFilters.collegeDistributions || {}) },
        // We'll preserve our requirement display metadata in the main effect above
      }));
    }
  }, [activeFilters]);

  // Handle checkbox changes
  const handleCheckboxChange = (category, option, checkboxType) => {
    setFilters(prevFilters => {
      // Create a deep copy of the relevant category
      const updatedCategory = JSON.parse(JSON.stringify(prevFilters[category]));
      
      // For "only" checkboxes, uncheck all other "only" options
      if (checkboxType === 'only' && !updatedCategory[option][checkboxType]) {
        Object.keys(updatedCategory).forEach(opt => {
          if (opt !== option) {
            updatedCategory[opt].only = false;
          }
        });
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
    handleApplyExternal(filters);
    handleClose();
  };

  const handleReset = () => {
    // Reset all filters but preserve structure and metadata
    const resetFilters = {
      level: Object.keys(filters.level).reduce((acc, level) => {
        acc[level] = { only: false, prefer: false };
        return acc;
      }, {}),
      enrollment: Object.keys(filters.enrollment).reduce((acc, option) => {
        acc[option] = { only: false, prefer: false };
        return acc;
      }, {}),
      instructionMode: Object.keys(filters.instructionMode).reduce((acc, mode) => {
        acc[mode] = { only: false, prefer: false };
        return acc;
      }, {}),
      majorRequirements: Object.entries(filters.majorRequirements).reduce((acc, [key, value]) => {
        acc[key] = {
          ...value,
          only: false,
          prefer: false
        };
        return acc;
      }, {})
    };
    
    setFilters(resetFilters);
  };

  // Early return if modal is not open
  if (!isOpen) return null;

  // Group major requirements by major for better organization
  const groupedRequirements = Object.entries(filters.majorRequirements).reduce((acc, [key, req]) => {
    const majorId = req.majorId;
    if (!acc[majorId]) {
      acc[majorId] = {
        name: req.majorName || majorId,
        requirements: {}
      };
    }
    acc[majorId].requirements[key] = req;
    return acc;
  }, {});

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Filter Courses</h2>
          <button className={styles.closeButton} onClick={handleClose}>×</button>
        </div>
        
        <div className={styles.modalBody}>
          {/* Level Section */}
          {Object.keys(filters.level).length > 0 && (
            <div className={styles.filterSection}>
              <h3>Level</h3>
              <div className={styles.filterOptions}>
                {Object.keys(filters.level).map(level => (
                  <div key={`level-${level}`} className={styles.filterOption}>
                    <div className={styles.optionLabel}>{level}</div>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.level[level].only}
                          onChange={() => handleCheckboxChange('level', level, 'only')}
                        />
                        Only
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.level[level].prefer}
                          onChange={() => handleCheckboxChange('level', level, 'prefer')}
                        />
                        Prefer
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrollment Requirements Section */}
          {Object.keys(filters.enrollment).length > 0 && (
            <div className={styles.filterSection}>
              <h3>Enrollment Requirements</h3>
              <div className={styles.filterOptions}>
                {Object.keys(filters.enrollment).map(option => (
                  <div key={`enrollment-${option}`} className={styles.filterOption}>
                    <div className={styles.optionLabel}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </div>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.enrollment[option].only}
                          onChange={() => handleCheckboxChange('enrollment', option, 'only')}
                        />
                        Only
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.enrollment[option].prefer}
                          onChange={() => handleCheckboxChange('enrollment', option, 'prefer')}
                        />
                        Prefer
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* College Distributions Section */}
          {Object.keys(filters.collegeDistributions).length > 0 && (
            <div className={styles.filterSection}>
              <h3>College Distributions</h3>
              <div className={styles.filterOptions}>
                {Object.keys(filters.collegeDistributions).map(dist => (
                  <div key={`dist-${dist}`} className={styles.filterOption}>
                    <div className={styles.optionLabel}>{dist}</div>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.collegeDistributions[dist].only}
                          onChange={() => handleCheckboxChange('collegeDistributions', dist, 'only')}
                        />
                        Only
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.collegeDistributions[dist].prefer}
                          onChange={() => handleCheckboxChange('collegeDistributions', dist, 'prefer')}
                        />
                        Prefer
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Major Requirements Sections */}
          {Object.keys(groupedRequirements).length > 0 && (
            <div className={styles.filterSection}>
              <h3>Major Requirements</h3>
              
              {Object.entries(groupedRequirements).map(([majorId, majorGroup]) => (
                <div key={`major-${majorId}`} className={styles.majorSection}>
                  <h4>{majorGroup.name}</h4>
                  <div className={styles.filterOptions}>
                    {Object.entries(majorGroup.requirements).map(([reqKey, req]) => (
                      <div key={reqKey} className={styles.filterOption}>
                        <div className={styles.optionLabel}>
                          {req.displayName}
                          {req.concentrationName && (
                            <span className={styles.concentrationTag}>
                              {` (${req.concentrationName})`}
                            </span>
                          )}
                        </div>
                        <div className={styles.checkboxGroup}>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={req.only}
                              onChange={() => handleCheckboxChange('majorRequirements', reqKey, 'only')}
                            />
                            Only
                          </label>
                          <label className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={req.prefer}
                              onChange={() => handleCheckboxChange('majorRequirements', reqKey, 'prefer')}
                            />
                            Prefer
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.resetButton} onClick={handleReset}>Reset</button>
          <button className={styles.applyButton} onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;