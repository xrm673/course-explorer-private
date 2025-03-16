import CoursePicks from './components/CoursePicks'
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext'
import { Link } from 'react-router';

export default function HomePage() {
  const { user, isLoggedIn } = useContext(UserContext);
  const { academicData } = useAcademic();
  console.log(academicData)
  return (
    <>
        {isLoggedIn ? (
          <div>
            Welcome, {user.netId}
                {/* Display other user info like college, majors, etc. */}
                {user.college && <span> | {user.college}</span>}
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
