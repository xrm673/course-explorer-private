import CoursePicks from './components/CoursePicks'
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext'
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

export default function HomePage() {
  const { user, isLoggedIn } = useContext(UserContext);
  const { academicData } = useAcademic();
  
  return (
    <div className={styles.container}>
        {isLoggedIn ? (
          <>
            {/* Logged-in experience */}
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Welcome back, {user?.name || 'Student'}!</h1>
            </div>
            
            {/* Course recommendations */}
            <CoursePicks />
            
            {/* Explore section */}
            <div className={styles.exploreSection}>
              <Link to="/majors" className={styles.exploreLink}>Explore Majors</Link>
              <Link to="/minors" className={styles.exploreLink}>Explore Minors</Link>
              <Link to="/subjects" className={styles.exploreLink}>Explore Subjects</Link>
            </div>
          </>
        ) : (
          <>
            {/* Guest experience */}
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Welcome to CU Explore!</h1>
              <p>Find your perfect courses and plan your academic journey at Cornell.</p>
            </div>
            
            {/* Explore section */}
            <div className={styles.exploreSection}>
              <Link to="/majors" className={styles.exploreLink}>Explore Majors</Link>
              <Link to="/minors" className={styles.exploreLink}>Explore Minors</Link>
              <Link to="/subjects" className={styles.exploreLink}>Explore Subjects</Link>
            </div>
            
            {/* Auth links */}
            <div className={styles.authSection}>
              <Link to="/signup" className={styles.authLink}>Sign Up</Link>
              <Link to="/login" className={`${styles.authLink} ${styles.loginLink}`}>Login</Link>
            </div>
          </>
        )}
    </div>
  )
}