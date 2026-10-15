import { createBrowserRouter } from 'react-router'

import { RequireAuth } from '@/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StudentLoginPage } from '@/pages/auth/StudentLoginPage'
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage'
import { TeacherLoginPage } from '@/pages/auth/TeacherLoginPage'
import { TeacherRegisterPage } from '@/pages/auth/TeacherRegisterPage'
import { QuizListPage } from '@/pages/quizzes/QuizListPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/prijava/ucenec', element: <StudentLoginPage /> },
  { path: '/prijava/ucitelj', element: <TeacherLoginPage /> },
  { path: '/registracija/ucenec', element: <StudentRegisterPage /> },
  { path: '/registracija/ucitelj', element: <TeacherRegisterPage /> },
  {
    element: <AppShell />,
    children: [
      {
        element: <RequireAuth />,
        children: [{ path: '/kvizi', element: <QuizListPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
