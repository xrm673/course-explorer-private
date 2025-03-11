import React, { useState } from 'react';
import styles from '../styles/SearchBar.module.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Mock data - replace with actual data when backend is ready
  const mockResults = [
    { id: 1, type: 'search', text: `Search: "${query}"` },
    { id: 2, type: 'course', text: 'CS 2110: Computer Organization and Programming' },
    { id: 3, type: 'course', text: 'INFO 1200: Information Ethics, Law, and Policy' },
    { id: 4, type: 'major', text: 'Computer Science Major' },
    { id: 5, type: 'minor', text: 'Information Science Minor' }
  ];

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  return (
    <div className={styles.searchBarContainer}>
      <div className={`${styles.searchBar} ${query.length > 0 ? styles.searching : ''}`}>
        <div className={styles.searchBarContent}>
          <svg 
            className={styles.searchIcon} 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          
          <input 
            className={styles.searchInput}
            type="text" 
            placeholder="Search for courses, majors, and minors"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            autoComplete="off"
          />
        </div>
      </div>
      
      {query.length > 0 && isFocused && (
        <div className={styles.searchResults}>
          {mockResults.map(result => (
            <div key={result.id} className={styles.resultItem}>
              <p className={styles.resultText}>{result.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}