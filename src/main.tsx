import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, createMemoryRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import './styles/index.css'

function Root() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}

function Loading() {
  return <div style={{ minHeight: '100dvh' }} aria-busy="true" />
}

// Design stage: hash routing keeps the build portable (any static folder, no server
// rewrites). The single-file build runs inside sandboxed viewers where the URL cannot
// carry a route, so it keeps the route in memory instead.
// TODO(launch): switch to path routing with pre-rendered pages for search engines.
const createRouter = import.meta.env.MODE === 'single' ? createMemoryRouter : createHashRouter
const router = createRouter([
  {
    element: <Root />,
    hydrateFallbackElement: <Loading />,
    children: [{ path: '*', lazy: () => import('./site').then((m) => ({ Component: m.default })) }],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
