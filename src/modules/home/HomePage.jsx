import CoursePicks from './components/CoursePicks'
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext'
import { Link } from 'react-router';
import { fetchMajorWithRequirements, fetchUserMajorsData } from '../../firebase/services/majorService';

export default function HomePage() {
  fetchUserMajorsData([{"id":"INFO","collegeId":"CAS","concentrations":["Data Science"]}])
  const { user, isLoggedIn } = useContext(UserContext);
  // console.log(isLoggedIn)
  const { academicData } = useAcademic();
  // console.log(academicData)
  return (
    <>
        {isLoggedIn ? (
          <div>
            <CoursePicks />
          </div>
          ) : (
            <div>
              <Link to="/signup">Sign Up</Link>
              <Link to="/login">Login</Link>
            </div>
        )}
        <button>Explore Minors</button>
        <button>Explore Majors</button>
        <button>Explore Subjects</button>
    </>
  )
}
