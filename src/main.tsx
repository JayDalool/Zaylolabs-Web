import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, createMemoryRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom'
import './styles/index.css'

function Root() {
  return (
    <>
      <Outlet />
      {/* A page opened directly starts at the top; going back returns to where you were. */}
      <ScrollRestoration getKey={(location) => (location.key === 'default' ? location.pathname + location.search : location.key)} />
    </>
  )
}

function Loading() {
  return <div style={{ minHeight: '100dvh' }} aria-busy="true" />
}

// Pages have normal addresses (/work/estatelab). The host must answer every address
// with index.html; public/_redirects does that on static hosts that read it.
// The single-file preview runs inside sandboxed viewers where the URL cannot carry
// a route, so it keeps the route in memory instead.
const createRouter = import.meta.env.MODE === 'single' ? createMemoryRouter : createBrowserRouter
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
