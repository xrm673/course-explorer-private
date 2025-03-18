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
    instructionMode: {
      inPerson: { only: false, prefer: false },
      onlineRecording: { only: false, prefer: false },
      onlineLive: { only: false, prefer: false },
      hybrid: { only: false, prefer: false },
      others: { only: false, prefer: false }
    },
    // Major requirements will be populated dynamically
    majorRequirements: {}
  });

  // Process requirements for all user's majors
  useEffect(() => {
    if (!user?.majors || !academicData?.majors || !academicData?.requirements) {
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
          // Use format: majorId_reqId as the key and store the human-readable name
          majorRequirements[reqId] = { 
            only: false, 
            prefer: false,
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
                  only: false, 
                  prefer: false,
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
      majorRequirements: {
        ...majorRequirements,
        // Preserve any existing filter selections
        ...(activeFilters?.majorRequirements || {})
      }
    }));
  }, [user, academicData, activeFilters]);

  // Merge any active filters when they change
  useEffect(() => {
    if (activeFilters) {
      setFilters(prev => ({
        ...prev,
        level: { ...prev.level, ...(activeFilters.level || {}) },
        enrollment: { ...prev.enrollment, ...(activeFilters.enrollment || {}) },
        instructionMode: { ...prev.instructionMode, ...(activeFilters.instructionMode || {}) },
        // For major requirements, we keep our processed version with display names
        // but update the checkbox states
        majorRequirements: Object.keys(prev.majorRequirements).reduce((acc, key) => {
          acc[key] = {
            ...prev.majorRequirements[key],
            only: activeFilters.majorRequirements?.[key]?.only || false,
            prefer: activeFilters.majorRequirements?.[key]?.prefer || false,
          };
          return acc;
        }, {})
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
    // Strip out display metadata before passing filter state back
    const cleanedFilters = {
      ...filters,
      majorRequirements: Object.entries(filters.majorRequirements).reduce((acc, [key, value]) => {
        acc[key] = { only: value.only, prefer: value.prefer };
        return acc;
      }, {})
    };
    
    // Call the external handler
    handleApplyExternal(cleanedFilters);
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

          {/* Instruction Mode Section */}
          {Object.keys(filters.instructionMode).length > 0 && (
            <div className={styles.filterSection}>
              <h3>Instruction Mode</h3>
              <div className={styles.filterOptions}>
                {Object.keys(filters.instructionMode).map(mode => (
                  <div key={`mode-${mode}`} className={styles.filterOption}>
                    <div className={styles.optionLabel}>
                      {mode === 'inPerson' ? 'In-Person' :
                       mode === 'onlineRecording' ? 'Online (Recording)' :
                       mode === 'onlineLive' ? 'Online (Live)' :
                       mode === 'hybrid' ? 'Hybrid' : 'Others'}
                    </div>
                    <div className={styles.checkboxGroup}>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.instructionMode[mode].only}
                          onChange={() => handleCheckboxChange('instructionMode', mode, 'only')}
                        />
                        Only
                      </label>
                      <label className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={filters.instructionMode[mode].prefer}
                          onChange={() => handleCheckboxChange('instructionMode', mode, 'prefer')}
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