/**
 * Modal de verificación de comprobante para ADMIN
 * Muestra el comprobante desde la base de datos y reconstruye el resultado de validación
 */

import { useMemo } from 'react';
import type { ComprobantePago } from '@/types/api';
import { ResultadoValidacionComponent } from './ResultadoValidacion';
import { Button } from './Button';
import { Alert } from './Alert';
import { Modal } from './Modal';

interface ModalVerificacionProps {
  isOpen: boolean;
  onClose: () => void;
  estudianteNombre?: string;
  estudianteGeneracion?: string;
  comprobante?: ComprobantePago;
}

export function ModalVerificacion({
  isOpen,
  onClose,
  estudianteNombre,
  estudianteGeneracion,
  comprobante,
}: ModalVerificacionProps) {
  // Reconstruir ResultadoValidacion desde los datos del comprobante
  const resultado = useMemo(() => {
    if (!comprobante) return null;

    // Convertir monto de string a number si es necesario
    const monto = typeof comprobante.monto === 'string' 
      ? parseFloat(comprobante.monto) 
      : Number(comprobante.monto);

    // Reconstruir datosExtraidos desde el comprobante
    const datosExtraidos = {
      numeroTransaccion: comprobante.numeroTransaccion || comprobante.documento || 'No encontrado',
      monto: isNaN(monto) ? 0 : monto,
      fecha: comprobante.fechaPago ? new Date(comprobante.fechaPago).toLocaleDateString('es-ES') : undefined,
      nombreCuentaDestino: comprobante.cuentaDestino,
    };

    // Si hay imagen del comprobante, el pago es válido
    const esValido = !!comprobante.urlImagen;
    const mensaje = esValido
      ? 'El pago ha sido confirmado y validado.'
      : 'El pago no ha sido realizado o no coincide con el registro.';

    return {
      valido: esValido,
      mensaje,
      datosExtraidos,
      // No tenemos coincidenciaExcel desde el comprobante, pero podemos intentar reconstruirla
      coincidenciaExcel: comprobante.numeroTransaccion && estudianteNombre && estudianteGeneracion
        ? {
            estudiante: estudianteNombre,
            generacion: estudianteGeneracion,
            numeroTransaccion: comprobante.numeroTransaccion,
            monto: monto,
          }
        : undefined,
    };
  }, [comprobante, estudianteNombre, estudianteGeneracion]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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

        {/* Imagen del comprobante */}
        {comprobante?.urlImagen && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Comprobante de Pago
            </h3>
            <div className="flex justify-center">
              <img
                src={comprobante.urlImagen}
                alt="Comprobante de pago"
                className="max-w-full h-auto rounded-lg shadow-md border border-gray-300"
                style={{ maxHeight: '500px' }}
              />
            </div>
          </div>
        )}

        {/* Resultado de validación */}
        {resultado ? (
          <div>
            <ResultadoValidacionComponent resultado={resultado} />
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : (
          <Alert
            type="warning"
            title="No hay comprobante disponible"
            message="Este estudiante aún no ha subido un comprobante de pago o la validación no se ha completado."
          />
        )}
      </div>
    </Modal>
  );
}
