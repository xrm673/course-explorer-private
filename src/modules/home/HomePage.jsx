import CoursePicks from './components/CoursePicks'
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

export default function HomePage() {
  const { user, isLoggedIn } = useContext(UserContext);
  console.log(user, isLoggedIn)
  return (
    <>
        {isLoggedIn ? (
          <div>
                Welcome, {user.netId}
                {/* Display other user info like college, majors, etc. */}
                {user.college && <span> | {user.college}</span>}
          </div>
          ) : (
            <button>Login</button>
        )}
        <CoursePicks />
        <button>Explore Minors</button>
        <button>Explore Majors</button>
        <button>Explore Subjects</button>
    </>
  )
}
