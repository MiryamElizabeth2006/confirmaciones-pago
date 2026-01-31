/**
 * Componente principal de la aplicación
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ValidacionPagoPage } from './pages/ValidacionPagoPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/estudiante" replace />} />
        <Route path="/estudiante" element={<ValidacionPagoPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/estudiante" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
