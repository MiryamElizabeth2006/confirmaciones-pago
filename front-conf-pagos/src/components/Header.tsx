/**
 * Componente Header con navegación
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logoKrake from '@/assets/logoKrakePNG.png';

interface HeaderProps {
  activeTab?: 'subir' ;
}

export function Header({ activeTab = 'subir' }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Determinar activeTab basado en la ruta actual
  const currentTab = location.pathname === '/admin' ? 'admin' : 'subir';

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);
  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0 bg-white rounded-full p-2 flex items-center justify-center">
              <img
                src={logoKrake}
                alt="Logo Krake"
                className="h-8 w-auto object-contain"
              />
            </div>
            <h1 className="text-base sm:text-lg font-bold truncate">Sistema de Validación de Pagos</h1>
          </div>

          {/* Navegación */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6 ml-4">
            <Link
              to="/estudiante"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'subir'
                  ? 'bg-red-700 text-white underline decoration-2 underline-offset-4'
                  : 'text-red-100 hover:bg-red-700 hover:text-white'
              }`}
            >
              Subir Pago
            </Link>
          </nav>

          {/* Perfil de usuario con menú desplegable */}
          <div className="flex items-center ml-2 sm:ml-4 relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center space-x-1 sm:space-x-2 bg-red-700 px-2 sm:px-3 py-2 rounded-lg hover:bg-red-800 transition-colors"
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div className="hidden md:block">
                <span className="text-xs text-red-200 block">
                  {currentTab === 'admin' ? 'Administrador' : 'Estudiante'}
                </span>
              </div>
              <svg
                className={`h-4 w-4 ml-1 flex-shrink-0 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Menú desplegable */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                <Link
                  to="/estudiante"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    currentTab === 'subir'
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <span>Vista Estudiante</span>
                  </div>
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-2 text-sm transition-colors ${
                    currentTab === 'admin'
                      ? 'bg-red-50 text-red-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    <span>Vista Administrador</span>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
