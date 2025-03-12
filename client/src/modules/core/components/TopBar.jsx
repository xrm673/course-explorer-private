import { useState } from 'react'
import styles from './TopBar.module.css'

import logo from '../../../assets/logo.svg'
import SearchBar from '../../searchBar/components/SearchBar'
import scheduleIcon from '../../../assets/schedule.svg'
import defaultAvator from '../../../assets/defaultAvator.svg'
import hamburgerIcon from '../../../assets/hamburgerIcon.svg'
import NavigationMenu from '../components/NavigationMenu';
import PersonalInfoModal from '../../personalInfo/PersonalInfoModal';
import ScheduleSidebar from '../../schedule/ScheduleSidebar';

export default function TopBar() {
    // Single state to track which modal is open (if any)
    const [openModal, setOpenModal] = useState(null);
    
    // Helper function to toggle modals
    const toggleModal = (modalName) => {
        if (openModal === modalName) {
            // If clicking the same button, close the modal
            setOpenModal(null);
        } else {
            // If clicking a different button, open that modal
            setOpenModal(modalName);
        }
    };

    // Helper function to determine button class based on active state
    const getButtonClass = (modalName, baseClass) => {
        return openModal === modalName ? 
            `${styles[baseClass]} ${styles.activeButton}` : 
            `${styles[baseClass]} ${styles.inactiveButton}`;
    };
    
    return (
        <>
            <div className={styles.topbar}>
                <a href="/">
                    <img 
                        src={logo} 
                        alt="CU Explore"
                        className={styles.logo}
                    />
                </a>

                <SearchBar />

                <button 
                    onClick={() => toggleModal('schedule')}
                    className={getButtonClass('schedule', 'scheduleButton')}
                >
                    <img 
                        src={scheduleIcon} 
                        alt="Schedule Icon"
                        className={styles.icon} 
                    />
                </button>

                <button 
                    onClick={() => toggleModal('profile')}
                    className={getButtonClass('profile', 'profileButton')}
                >
                    <img 
                        src={defaultAvator} 
                        alt="Avatar"
                        className={styles.icon} 
                    />
                </button>
                
                <button 
                    onClick={() => toggleModal('navigation')}
                    className={getButtonClass('navigation', 'navigationButton')}
                >
                    <img 
                        src={hamburgerIcon} 
                        alt="Hamburger"
                        className={styles.icon} 
                    />
                </button>
            </div>

            {/* Render the modals/menus conditionally based on which one is open */}
            {openModal === 'navigation' && <NavigationMenu onClose={() => setOpenModal(null)} />}
            {openModal === 'profile' && <PersonalInfoModal onClose={() => setOpenModal(null)} />}
            {openModal === 'schedule' && <ScheduleSidebar onClose={() => setOpenModal(null)} />}
        </>
    );
}