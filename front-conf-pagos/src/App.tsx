/**
 * Componente principal de la aplicación
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ValidacionPagoPage } from './pages/ValidacionPagoPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ValidacionPagoPage />} />
        <Route path="*" element={<ValidacionPagoPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
