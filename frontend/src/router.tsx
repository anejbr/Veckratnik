import { createBrowserRouter } from 'react-router'

import { RequireAuth } from '@/auth/RequireAuth'
import { AppShell } from '@/components/layout/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { StudentLoginPage } from '@/pages/auth/StudentLoginPage'
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage'
import { TeacherLoginPage } from '@/pages/auth/TeacherLoginPage'
import { TeacherRegisterPage } from '@/pages/auth/TeacherRegisterPage'
import { QuizDetailPage } from '@/pages/quizzes/QuizDetailPage'
import { QuizListPage } from '@/pages/quizzes/QuizListPage'
import { QuizPlayPage } from '@/pages/quizzes/QuizPlayPage'
import { QuizResultPage } from '@/pages/quizzes/QuizResultPage'
import { MyQuizzesPage } from '@/pages/teacher/MyQuizzesPage'
import { QuizBuilderPage } from '@/pages/teacher/QuizBuilderPage'

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/prijava/ucenec', element: <StudentLoginPage /> },
  { path: '/prijava/ucitelj', element: <TeacherLoginPage /> },
  { path: '/registracija/ucenec', element: <StudentRegisterPage /> },
  { path: '/registracija/ucitelj', element: <TeacherRegisterPage /> },
  {
    element: <RequireAuth />,
    children: [{ path: '/kvizi/:quizId/resevanje/:attemptId', element: <QuizPlayPage /> }],
  },
  {
    element: <AppShell />,
    children: [
      {
        element: <RequireAuth />,
        children: [
          { path: '/kvizi', element: <QuizListPage /> },
          { path: '/kvizi/:quizId', element: <QuizDetailPage /> },
          { path: '/rezultati/:attemptId', element: <QuizResultPage /> },
        ],
      },
      {
        element: <RequireAuth role="teacher" />,
        children: [
          { path: '/ucitelj/kvizi', element: <MyQuizzesPage /> },
          { path: '/ucitelj/kvizi/nov', element: <QuizBuilderPage /> },
          { path: '/ucitelj/kvizi/:quizId/uredi', element: <QuizBuilderPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
