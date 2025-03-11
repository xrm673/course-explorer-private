import { Routes, Route } from 'react-router-dom'

// Import page components from modules
import MainLayout from './modules/core/MainLayout'
import HomePage from './modules/home/HomePage'
import MajorListPage from './modules/majorList/MajorListPage'
import SingleMajorPage from './modules/singleMajor/SingleMajorPage'
import MinorListPage from './modules/minorList/MinorListPage'
import SingleMinorPage from './modules/singleMinor/SingleMinorPage'
import SubjectListPage from './modules/subjectList/SubjectListPage'
import SingleCoursePage from './modules/singleCourse/SingleCoursePage'
import CollegePage from './modules/college/CollegePage'
import MyDashboardPage from './modules/myDashboard/MyDashboardPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="majors" element={<MajorListPage />} />
        <Route path="majors/:majorId" element={<SingleMajorPage />} />
        <Route path="minors" element={<MinorListPage />} />
        <Route path="minors/:minorId" element={<SingleMinorPage />} />
        <Route path="subjects" element={<SubjectListPage />} />
        <Route path="courses/:courseId" element={<SingleCoursePage />} />
        <Route path="colleges/:collegeId" element={<CollegePage />} />
        <Route path="dashboard" element={<MyDashboardPage />} />
      </Route>
    </Routes>
  )
}

export default App