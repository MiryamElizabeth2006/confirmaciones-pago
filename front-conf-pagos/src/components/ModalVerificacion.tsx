/**
 * Modal de verificación de comprobante para ADMIN
 * Reutiliza la lógica existente de validación
 */

import { useState, useEffect } from 'react';
import { obtenerValidacionPorEstudiante } from '@/utils/storage';
import { ResultadoValidacionComponent } from './ResultadoValidacion';
import { Button } from './Button';
import { Alert } from './Alert';
import { Modal } from './Modal';

interface ModalVerificacionProps {
  isOpen: boolean;
  onClose: () => void;
  estudianteNombre?: string;
  estudianteGeneracion?: string;
}

export function ModalVerificacion({
  isOpen,
  onClose,
  estudianteNombre,
  estudianteGeneracion,
}: ModalVerificacionProps) {
  const [resultado, setResultado] = useState<import('@/types/api').ResultadoValidacion | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar resultado cuando se abre el modal
  useEffect(() => {
    if (isOpen && estudianteNombre && estudianteGeneracion) {
      setLoading(true);
      // Buscar el resultado guardado
      const validacionGuardada = obtenerValidacionPorEstudiante(
        estudianteNombre,
        estudianteGeneracion,
      );
      
      if (validacionGuardada) {
        setResultado(validacionGuardada.resultado);
      } else {
        setResultado(null);
      }
      setLoading(false);
    } else {
      setResultado(null);
    }
  }, [isOpen, estudianteNombre, estudianteGeneracion]);

  const handleClose = () => {
    setResultado(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Verificación de Comprobante"
      size="xl"
    >
      <div className="space-y-6">
        {/* Información del estudiante */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">
            <strong>Estudiante:</strong> {estudianteNombre || 'No especificado'}
          </p>
          <p className="text-sm font-medium text-blue-900 mt-1">
            <strong>Generación:</strong> {estudianteGeneracion || 'No especificada'}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-2 text-gray-600">Cargando resultado de validación...</p>
          </div>
        )}

        {/* Resultado de validación */}
        {!loading && resultado ? (
          <div>
            <ResultadoValidacionComponent resultado={resultado} />
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : !loading && !resultado ? (
          <Alert
            type="warning"
            title="No hay resultado disponible"
            message="Este estudiante aún no ha subido un comprobante de pago o la validación no se ha completado."
          />
        ) : null}
      </div>
    </Modal>
  );
}
