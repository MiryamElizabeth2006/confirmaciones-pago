/**
 * Componente para mostrar el resultado de la validación
 */

import type { ResultadoValidacion } from '@/types/api';
import { Alert } from './Alert';

interface ResultadoValidacionProps {
  resultado: ResultadoValidacion;
}

export function ResultadoValidacionComponent({ resultado }: ResultadoValidacionProps) {
  const isValido = resultado.valido;

  return (
    <div className="space-y-4">
      <Alert
        type={isValido ? 'success' : 'error'}
        title={isValido ? 'Pago Válido' : 'Pago Inválido'}
        message={resultado.mensaje}
      />

      {resultado.datosExtraidos && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Datos Extraídos del Comprobante
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Número de Transacción</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {resultado.datosExtraidos.numeroTransaccion || 'No encontrado'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Monto</dt>
              <dd className="mt-1 text-sm text-gray-900">
                ${resultado.datosExtraidos.monto.toFixed(2)}
              </dd>
            </div>
            {resultado.datosExtraidos.fecha && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {resultado.datosExtraidos.fecha}
                </dd>
              </div>
            )}
            {resultado.datosExtraidos.nombreCuentaDestino && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Cuenta Destino</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {resultado.datosExtraidos.nombreCuentaDestino}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {resultado.coincidenciaExcel && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Coincidencia en el Registro
          </h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-blue-700">Estudiante</dt>
              <dd className="mt-1 text-sm text-blue-900">
                {resultado.coincidenciaExcel.estudiante}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-blue-700">Generación</dt>
              <dd className="mt-1 text-sm text-blue-900">
                {resultado.coincidenciaExcel.generacion}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-blue-700">Número de Transacción</dt>
              <dd className="mt-1 text-sm text-blue-900">
                {resultado.coincidenciaExcel.numeroTransaccion}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-blue-700">Monto</dt>
              <dd className="mt-1 text-sm text-blue-900">
                ${resultado.coincidenciaExcel.monto.toFixed(2)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {resultado.error && (
        <Alert
          type="warning"
          title="Error Técnico"
          message={`Detalles: ${resultado.error}`}
        />
      )}
    </div>
  );
}
