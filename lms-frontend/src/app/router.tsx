import { Routes, Route } from 'react-router-dom'
import LandingPage from '../features/home/LandingPage'
import CourseDetailsPublicPage from '../features/home/CourseDetailsPublicPage'
import Login from '../features/auth/Login'
import Signup from '../features/auth/Signup'
import { RequireAuth, RequireRole } from './guards'
import AdminLayout from '../layouts/AdminLayout'
import UserLayout from '../layouts/UserLayout'
import MentorLayout from '../layouts/MentorLayout'

import AdminHome from '../features/admin/dashboard/AdminHome'
import InstitutesPage from '../features/admin/institutes/InstitutesPage'
import InstituteCreatePage from '../features/admin/institutes/InstituteCreatePage'
import InstituteEditPage from '../features/admin/institutes/InstituteEditPage'
import InstituteDetailsPage from '../features/admin/institutes/InstituteDetailsPage'
import BatchesPage from '../features/admin/batches/BatchesPage'
import BatchDetailsPage from '../features/admin/batches/BatchDetailsPage'
import CoursesPage from '../features/admin/courses/CoursesPage'
import CourseBuilderPage from '../features/admin/courses/CourseBuilderPage'
import CourseDetailsPage from '../features/admin/courses/CourseDetailsPage'
import CourseCreatePage from '../features/admin/courses/CourseCreatePage'
import CourseEditPage from '../features/admin/courses/CourseEditPage'
import TopicEditPage from '../features/admin/courses/TopicEditPage'
import UsersPage from '../features/admin/users/UsersPage'
import UserCreatePage from '../features/admin/users/UserCreatePage'
import UserEditPage from '../features/admin/users/UserEditPage'
import UserDetailsPage from '../features/admin/users/UserDetailsPage'
import MentorsPage from '../features/admin/mentors/MentorsPage'
import MentorCreatePage from '../features/admin/mentors/MentorCreatePage'
import MentorEditPage from '../features/admin/mentors/MentorEditPage'
import QuizzesPage from '../features/admin/quizzes/QuizzesPage'
import QuestionBankPage from '../features/admin/questions/QuestionBankPage'
import QuestionCreatePage from '../features/admin/questions/QuestionCreatePage'
import QuestionEditPage from '../features/admin/questions/QuestionEditPage'
import TopicLibraryPage from '../features/admin/topics/TopicLibraryPage'
import TopicLibraryCreatePage from '../features/admin/topics/TopicCreatePage'
import TopicLibraryEditPage from '../features/admin/topics/TopicEditPage'
import AdminHTMLPlayPage from '../features/admin/htmlplay/HTMLPlayPage'
import InteractionSessionsManagement from '../features/admin/interaction/InteractionSessionsManagement'

import UserHome from '../features/user/dashboard/UserHome'
import UserCoursePage from '../features/user/courses/UserCoursePage'
import ProfilePage from '../features/user/profile/ProfilePage'
import ChangePasswordPage from '../features/user/profile/ChangePasswordPage'
import ProfileImagePage from '../features/user/profile/ProfileImagePage'
import UserHTMLPlayPage from '../features/user/htmlplay/HTMLPlayPage'
import MentorHome from '../features/mentor/dashboard/MentorHome'
import StudentDetailsPage from '../features/mentor/dashboard/StudentDetailsPage'

import InteractionBoard from '../features/interaction/InteractionBoard'
import SessionReview from '../features/interaction/SessionReview'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/courses/:id" element={<CourseDetailsPublicPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/admin" element={
        <RequireRole role="admin">
          <AdminLayout><AdminHome /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/institutes" element={
        <RequireRole role="admin">
          <AdminLayout><InstitutesPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/institutes/new" element={
        <RequireRole role="admin">
          <AdminLayout><InstituteCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/institutes/:id" element={
        <RequireRole role="admin">
          <AdminLayout><InstituteDetailsPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/institutes/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><InstituteEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/batches" element={
        <RequireRole role="admin">
          <AdminLayout><BatchesPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/batches/:id" element={
        <RequireRole role="admin">
          <AdminLayout><BatchDetailsPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/courses" element={
        <RequireRole role="admin">
          <AdminLayout><CoursesPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/courses/new" element={
        <RequireRole role="admin">
          <AdminLayout><CourseCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/courses/:id" element={
        <RequireRole role="admin">
          <AdminLayout><CourseDetailsPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/courses/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><CourseEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/courses/:id/builder" element={
        <RequireRole role="admin">
          <AdminLayout><CourseBuilderPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/users" element={
        <RequireRole role="admin">
          <AdminLayout><UsersPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/users/new" element={
        <RequireRole role="admin">
          <AdminLayout><UserCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/users/:id" element={
        <RequireRole role="admin">
          <AdminLayout><UserDetailsPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/users/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><UserEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/mentors" element={
        <RequireRole role="admin">
          <AdminLayout><MentorsPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/mentors/create" element={
        <RequireRole role="admin">
          <AdminLayout><MentorCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/mentors/edit/:id" element={
        <RequireRole role="admin">
          <AdminLayout><MentorEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/quizzes" element={
        <RequireRole role="admin">
          <AdminLayout><QuizzesPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/questions" element={
        <RequireRole role="admin">
          <AdminLayout><QuestionBankPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/questions/new" element={
        <RequireRole role="admin">
          <AdminLayout><QuestionCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/questions/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><QuestionEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/topics-lib" element={
        <RequireRole role="admin">
          <AdminLayout><TopicLibraryPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/topics-lib/new" element={
        <RequireRole role="admin">
          <AdminLayout><TopicLibraryCreatePage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/topics-lib/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><TopicLibraryEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/topics/:id/edit" element={
        <RequireRole role="admin">
          <AdminLayout><TopicEditPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/htmlplay" element={
        <RequireRole role="admin">
          <AdminLayout><AdminHTMLPlayPage /></AdminLayout>
        </RequireRole>
      } />
      <Route path="/admin/interaction" element={
        <RequireRole role="admin">
          <AdminLayout><InteractionSessionsManagement /></AdminLayout>
        </RequireRole>
      } />

      <Route path="/app" element={
        <RequireAuth>
          <UserLayout><UserHome /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/app/courses/:id" element={
        <RequireAuth>
          <UserLayout><UserCoursePage /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/app/profile" element={
        <RequireAuth>
          <UserLayout><ProfilePage /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/app/change-password" element={
        <RequireAuth>
          <UserLayout><ChangePasswordPage /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/app/profile-image" element={
        <RequireAuth>
          <UserLayout><ProfileImagePage /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/app/htmlplay" element={
        <RequireAuth>
          <UserLayout><UserHTMLPlayPage /></UserLayout>
        </RequireAuth>
      } />
      <Route path="/user/interaction/:id" element={
        <RequireAuth>
          <UserLayout><InteractionBoard /></UserLayout>
        </RequireAuth>
      } />

      <Route path="/mentor" element={
        <RequireRole role="mentor">
          <MentorLayout><MentorHome /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/profile" element={
        <RequireRole role="mentor">
          <MentorLayout><ProfilePage /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/change-password" element={
        <RequireRole role="mentor">
          <MentorLayout><ChangePasswordPage /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/profile-image" element={
        <RequireRole role="mentor">
          <MentorLayout><ProfileImagePage /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/htmlplay" element={
        <RequireRole role="mentor">
          <MentorLayout><UserHTMLPlayPage /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/students/:id" element={
        <RequireRole role="mentor">
          <MentorLayout><StudentDetailsPage /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/interaction/:id" element={
        <RequireRole role="mentor">
          <MentorLayout><InteractionBoard /></MentorLayout>
        </RequireRole>
      } />
      <Route path="/mentor/interaction/:id/review" element={
        <RequireRole role="mentor">
          <MentorLayout><SessionReview /></MentorLayout>
        </RequireRole>
      } />
    </Routes>
  )
}
