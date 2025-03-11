import { useState } from 'react'

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
    
    return (
        <>
            <div style={{
                "display": "flex",
                "flexDirection": "row",
                "alignItems": "center",
                "justifyContent": "center",
                "width": "100%",
                "height": "100px",
                "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
                "position": "sticky",
                "top": 0,
                "zIndex": 100,
                "backgroundColor": "white"
            }}>
                <a href="/">
                    <img 
                        src={logo} 
                        alt="CU Explore"
                        style={{
                            "width": "150px",
                            "margin": "0 100px 0 10px",
                            "cursor": "pointer"
                        }}
                    />
                </a>

                <SearchBar />

                <button 
                    onClick={() => toggleModal('schedule')}
                    style={{
                        "background": "none",
                        "border": "none",
                        "cursor": "pointer",
                        "margin": "0 25px 0 150px",
                        "padding": 0,
                        "opacity": openModal === 'schedule' ? 0.7 : 1,
                        "transform": openModal === 'schedule' ? 'scale(1.1)' : 'scale(1)',
                        "transition": "all 0.2s ease-in-out"
                    }}
                >
                    <img 
                        src={scheduleIcon} 
                        alt="Schedule Icon"
                        style={{
                            "width": "40px"
                        }} 
                    />
                </button>

                <button 
                    onClick={() => toggleModal('profile')}
                    style={{
                        "background": "none",
                        "border": "none",
                        "cursor": "pointer",
                        "margin": "0 25px 0 25px",
                        "padding": 0,
                        "opacity": openModal === 'profile' ? 0.7 : 1,
                        "transform": openModal === 'profile' ? 'scale(1.1)' : 'scale(1)',
                        "transition": "all 0.2s ease-in-out"
                    }}
                >
                    <img 
                        src={defaultAvator} 
                        alt="Avatar"
                        style={{
                            "width": "40px"
                        }} 
                    />
                </button>
                
                <button 
                    onClick={() => toggleModal('navigation')}
                    style={{
                        "background": "none",
                        "border": "none",
                        "cursor": "pointer",
                        "margin": "0 0 0 25px",
                        "padding": 0,
                        "opacity": openModal === 'navigation' ? 0.7 : 1,
                        "transform": openModal === 'navigation' ? 'scale(1.1)' : 'scale(1)',
                        "transition": "all 0.2s ease-in-out"
                    }}
                >
                    <img 
                        src={hamburgerIcon} 
                        alt="Hamburger"
                        style={{
                            "width": "40px"
                        }} 
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