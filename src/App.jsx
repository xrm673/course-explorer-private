import { Routes, Route } from 'react-router-dom'
import { AcademicProvider } from './context/AcademicContext'

// Import page components from modules
import MainLayout from './modules/core/MainLayout'
import HomePage from './modules/home/HomePage'

import SignUp from './modules/userOnBoarding/SignUp'
import LogIn from './modules/userOnBoarding/LogIn'
import SelectConcentration from './modules/userOnBoarding/SelectConcentration'
import SelectCourses from './modules/userOnBoarding/SelectCourses'

import MajorListPage from './modules/majorList/MajorListPage'
import SingleMajorPage from './modules/singleMajor/SingleMajorPage'
import MinorListPage from './modules/minorList/MinorListPage'
import SingleMinorPage from './modules/singleMinor/SingleMinorPage'
import SubjectListPage from './modules/subjectList/SubjectListPage'
import SingleSubjectPage from './modules/singleSubject/singleSubjectPage'
import SingleCoursePage from './modules/singleCourse/SingleCoursePage'
import CollegePage from './modules/college/CollegePage'
import MyDashboardPage from './modules/myDashboard/MyDashboardPage'

function App() {
  return (
    <AcademicProvider>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="login" element={<LogIn />} />
          <Route path="select-concentration" element={<SelectConcentration />} />
          <Route path="select-courses" element={<SelectCourses />} />
          <Route path="majors" element={<MajorListPage />} />
          <Route path="majors/:majorId" element={<SingleMajorPage />} />
          <Route path="minors" element={<MinorListPage />} />
          <Route path="minors/:minorId" element={<SingleMinorPage />} />
          <Route path="subjects" element={<SubjectListPage />} />
          <Route path="subjects/:subjectId" element={<SingleSubjectPage />} />
          <Route path="courses/:courseId" element={<SingleCoursePage />} />
          <Route path="colleges/:collegeId" element={<CollegePage />} />
          <Route path="dashboard" element={<MyDashboardPage />} />
        </Route>
      </Routes>
    </AcademicProvider>
  )
}

export default App