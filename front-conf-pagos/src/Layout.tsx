import { Outlet, Link, useLocation } from 'react-router-dom'

export default function Layout() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="app-shell">
      <nav className="nav-bar">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            Confirmación de pago
          </Link>
          <div className="nav-links">
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Inicio
            </Link>
            <Link
              to="/admin"
              className={isAdmin ? 'nav-link active' : 'nav-link'}
            >
              Administrador
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
