import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import styles from './PersonalInfoModal.module.css';

import { Link } from 'react-router-dom';

export default function PersonalInfoModal({ onClose }) {
    // Sample user data - in a real app, this would come from props or context
    const userData = {
        credits: 60,
        graduationYear: 2026,
        college: "College of Arts & Sciences",
        majors: [{ name: "Computer Science", progress: 45 }],
        minors: [{ name: "Information Science", progress: 30 }]
    };
    const { user, isLoggedIn, setUser } = useContext(UserContext);
    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
      };

    return (
        <aside className={styles.modalContainer}>
            <header className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>Profile</h2>
                <button 
                    onClick={onClose}
                    className={styles.closeButton}
                >
                    ×
                </button>
            </header>
            
            {isLoggedIn ? (
                <div>
                    <section className={styles.profileSection}>
                        <div className={styles.userInfoContainer}>
                            <div className={styles.avatar}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className={styles.userName}>{user.name}</p>
                                <p>{userData.credits} credits</p>
                                <p>Class of {userData.graduationYear}</p>
                            </div>
                        </div>
                        
                        <button className={styles.editProfileButton}>
                            Edit Profile
                        </button>
                        
                        <a href="/dashboard" className={styles.dashboardLink}>
                            My Dashboard
                        </a>
                    </section>
                    
                    <section className={styles.sectionContainer}>
                        <h3 className={styles.sectionHeading}>College</h3>
                        <a href={`/college`} className={styles.collegeLink}>
                            {userData.college}
                        </a>
                    </section>
                    
                    <section className={styles.sectionContainer}>
                        <h3 className={styles.sectionHeading}>Majors</h3>
                        {userData.majors.map((major, index) => (
                            <article key={index} className={styles.progressContainer}>
                                <div className={styles.progressHeader}>
                                    <a href={`/major/${major.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.progressLink}>
                                        {major.name}
                                    </a>
                                    <span>{major.progress}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${major.progress}%` }}></div>
                                </div>
                            </article>
                        ))}
                    </section>
                    
                    <section className={styles.sectionContainer}>
                        <h3 className={styles.sectionHeading}>Minors</h3>
                        {userData.minors.map((minor, index) => (
                            <article key={index} className={styles.progressContainer}>
                                <div className={styles.progressHeader}>
                                    <a href={`/minor/${minor.name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.progressLink}>
                                        {minor.name}
                                    </a>
                                    <span>{minor.progress}%</span>
                                </div>
                                <div className={styles.progressBar}>
                                    <div className={styles.progressFill} style={{ width: `${minor.progress}%` }}></div>
                                </div>
                            </article>
                        ))}
                    </section>
                    
                    <button onClick={handleLogout} className={styles.logoutButton}>
                        Log Out
                    </button>
                    </div>
                ) : (
                    <div>
                        <Link to="/login" className={styles.loginButton}>
                            Log In
                        </Link>
                        <Link to="/signup" className={styles.signupButton}>
                            Sign Up
                        </Link>
                    </div>

            )}
        </aside>
    );
}