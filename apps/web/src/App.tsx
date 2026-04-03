import './App.css'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RouteSkeleton } from './components/feedback/RouteSkeleton'
import { AppLayout } from './components/layout/AppLayout'
import { DashboardProvider } from './context/DashboardContext'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const AccountsPage = lazy(() =>
  import('./pages/AccountsPage').then((module) => ({ default: module.AccountsPage })),
)
const SpendingPage = lazy(() =>
  import('./pages/SpendingPage').then((module) => ({ default: module.SpendingPage })),
)
const TransactionsPage = lazy(() =>
  import('./pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })),
)
const GoalsPage = lazy(() =>
  import('./pages/GoalsPage').then((module) => ({ default: module.GoalsPage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteSkeleton />}>{node}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: withSuspense(<DashboardPage />) },
      { path: 'accounts', element: withSuspense(<AccountsPage />) },
      { path: 'spending', element: withSuspense(<SpendingPage />) },
      { path: 'transactions', element: withSuspense(<TransactionsPage />) },
      { path: 'goals', element: withSuspense(<GoalsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

function App() {
  return (
    <DashboardProvider>
      <RouterProvider router={router} />
    </DashboardProvider>
  )
}

export default App
