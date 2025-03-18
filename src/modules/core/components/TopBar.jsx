import { useContext } from 'react'
import styles from './TopBar.module.css'
import { SidebarContext } from '../MainLayout'

import logo from '../../../assets/logo.svg'
import SearchBar from '../../searchBar/components/SearchBar'
import scheduleIcon from '../../../assets/schedule.svg'
import defaultAvator from '../../../assets/defaultAvator.svg'

export default function TopBar() {
    // Use the shared context instead of local state
    const { activeSidebar, toggleSidebar } = useContext(SidebarContext);
    
    // Helper function to determine button class based on active state
    const getButtonClass = (sidebarName, baseClass) => {
        return activeSidebar === sidebarName ? 
            `${styles[baseClass]} ${styles.activeButton}` : 
            `${styles[baseClass]} ${styles.inactiveButton}`;
    };
    
    return (
        <div className={styles.topbar}>
            <a href="/" className={styles.logoLink}>
                <img 
                    src={logo} 
                    alt="CU Explore"
                    className={styles.logo}
                />
            </a>

            <div className={styles.navLinks}>
                <a href="/majors" className={styles.navLink}>Majors</a>
                <a href="/minors" className={styles.navLink}>Minors</a>
                <a href="/subjects" className={styles.navLink}>Subjects</a>
            </div>

            <SearchBar />

            <div className={styles.rightControls}>
                <button 
                    onClick={() => toggleSidebar('schedule')}
                    className={getButtonClass('schedule', 'scheduleButton')}
                >
                    <img 
                        src={scheduleIcon} 
                        alt="Schedule Icon"
                        className={styles.icon} 
                    />
                </button>

                <button 
                    onClick={() => toggleSidebar('profile')}
                    className={getButtonClass('profile', 'profileButton')}
                >
                    <img 
                        src={defaultAvator} 
                        alt="Avatar"
                        className={styles.icon} 
                    />
                </button>
            </div>
        </div>
    );
}