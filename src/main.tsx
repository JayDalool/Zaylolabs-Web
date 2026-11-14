import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, createMemoryRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import { ConceptSwitcher } from './shared/ConceptSwitcher'
import './styles/index.css'

function Root() {
  return (
    <>
      <Outlet />
      <ConceptSwitcher />
      <ScrollRestoration />
    </>
  )
}

function Loading() {
  return <div style={{ minHeight: '100dvh' }} aria-busy="true" />
}

// Hash routing keeps the prototype portable: it works from a dev server or a
// static folder. The single-file build runs inside sandboxed viewers where the
// URL cannot carry a route, so it keeps the route in memory instead.
// Every concept is its own lazy chunk.
const createRouter = import.meta.env.MODE === 'single' ? createMemoryRouter : createHashRouter
const router = createRouter([
  {
    element: <Root />,
    hydrateFallbackElement: <Loading />,
    children: [
      { index: true, lazy: () => import('./hub/CompareHub').then((m) => ({ Component: m.default })) },
      { path: 'specimen/*', lazy: () => import('./concepts/specimen').then((m) => ({ Component: m.default })) },
      { path: 'z-axis/*', lazy: () => import('./concepts/zaxis').then((m) => ({ Component: m.default })) },
      { path: 'studio-os', lazy: () => import('./concepts/studio-os').then((m) => ({ Component: m.default })) },
      { path: 'plain-view/*', lazy: () => import('./concepts/plainview').then((m) => ({ Component: m.default })) },
      { path: '*', lazy: () => import('./hub/CompareHub').then((m) => ({ Component: m.default })) },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
