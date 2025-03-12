import React from 'react';
import styles from './NavigationMenu.module.css';

export default function NavigationMenu({ onClose }) {
  return (
    <div className={styles.menu}>
      <div className={styles.header}>
        <h2>Menu</h2>
        <button onClick={onClose} className={styles.close}>
          ×
        </button>
      </div>
      <nav className={styles.nav}>
        <ul>
          <li>
            <a href="/">Home</a>
          </li>
          <li>
            <a href="/majors">Majors</a>
          </li>
          <li>
            <a href="/minors">Minors</a>
          </li>
          <li>
            <a href="/subjects">Subjects</a>
          </li>
          <li>
            <a href="/dashboard">My Dashboard</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}