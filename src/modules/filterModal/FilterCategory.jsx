// FilterCategory.jsx

import styles from './FilterModal.module.css';

export default function FilterCategory({ categoryKey, categoryData, title, onCheckboxChange }){
    // For normal categories
    if (categoryKey !== 'majorRequirements') {
      return (
        <div className={styles.filterSection}>
          <h3>{title}</h3>
          <div className={styles.filterOptions}>
            {Object.keys(categoryData).map(option => (
              <div key={`${categoryKey}-${option}`} className={styles.filterOption}>
                <div className={styles.optionLabel}>
                  { option }
                </div>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={categoryData[option].only}
                      onChange={() => onCheckboxChange(categoryKey, option, 'only')}
                    />
                    Only
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={categoryData[option].prefer}
                      onChange={() => onCheckboxChange(categoryKey, option, 'prefer')}
                    />
                    Prefer
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Special handling for major requirements
    const groupedRequirements = Object.entries(categoryData).reduce((acc, [key, req]) => {
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
                        onChange={() => onCheckboxChange('majorRequirements', reqKey, 'only')}
                      />
                      Only
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={req.prefer}
                        onChange={() => onCheckboxChange('majorRequirements', reqKey, 'prefer')}
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
    );
  };