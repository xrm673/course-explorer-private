import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './MajorSearchInSignUp.css';

export default function MajorSearchInSignUp({ onAddMajor }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const searchRef = useRef(null);

  // Fetch colleges and their majors from Firestore
  useEffect(() => {
    const fetchCollegesAndMajors = async () => {
      try {
        const collegesCollection = await getDocs(collection(db, 'colleges'));
        const collegesData = collegesCollection.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name,
          majors: doc.data().majors || []
        }));
        setColleges(collegesData);
      } catch (error) {
        console.error('Error fetching colleges:', error);
      }
    };

    fetchCollegesAndMajors();
  }, []);

  // Filter colleges and majors based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredColleges([]);
      return;
    }

    const filtered = colleges.map(college => {
      // Filter majors that match the search query
      const filteredMajors = college.majors.filter(major => 
        major.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        major.id.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Return college with filtered majors
      return {
        ...college,
        majors: filteredMajors
      };
    }).filter(college => college.majors.length > 0); // Only include colleges that have matching majors

    setFilteredColleges(filtered);
    setShowDropdown(true);
  }, [searchQuery, colleges]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSelectMajor = (major, collegeId) => {
    // Only pass id and collegeId, no display properties
    onAddMajor({
      id: major.id,
      collegeId: collegeId,
      // We'll keep display names in component state for UI only, won't be stored
      __displayName: major.name // Double underscore to indicate it's purely local
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="major-search-container" ref={searchRef}>
      <div className="major-search-input-container">
        <input
          type="text"
          className="major-search-input"
          placeholder="Enter full major name..."
          value={searchQuery}
          onChange={handleSearchChange}
          onClick={() => setShowDropdown(true)}
        />
        {searchQuery && (
          <button className="major-clear-button" onClick={handleClearSearch}>
            ×
          </button>
        )}
      </div>

      {showDropdown && filteredColleges.length > 0 && (
        <div className="major-search-dropdown">
          {filteredColleges.map(college => (
            <div key={college.id} className="college-section">
              <div className="college-header">{college.name}</div>
              {college.majors.map(major => (
                <div 
                  key={major.id} 
                  className="major-item"
                  onClick={() => handleSelectMajor(major, college.id)}
                >
                  {major.name}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}