/**
 * Página de ADMIN con tabla de estudiantes y verificación de comprobantes
 */

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { ModalVerificacion } from '@/components/ModalVerificacion';
import { Alert } from '@/components/Alert';
import { useEstudiantesConComprobantes } from '@/hooks/useEstudiantesConComprobantes';
import type { Estudiante } from '@/types/api';
import { formatCurrency } from '@/utils/formatters';

export function AdminPage() {
  const { data: estudiantes, loading, error } = useEstudiantesConComprobantes();
  const [selectedEstudiante, setSelectedEstudiante] = useState<Estudiante | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerificar = (estudiante: Estudiante) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
  };

  // Calcular abono total (suma de todos los pagos del estudiante)
  const calcularAbono = (estudiante: Estudiante): number => {
    if (!estudiante.pagos || estudiante.pagos.length === 0) {
      // Si no hay pagos, usar el monto del comprobante más reciente
      const comprobanteMasReciente = estudiante.comprobantes?.[0];
      if (comprobanteMasReciente) {
        // Prisma puede devolver Decimal como string o number
        const monto = typeof comprobanteMasReciente.monto === 'string' 
          ? parseFloat(comprobanteMasReciente.monto) 
          : Number(comprobanteMasReciente.monto);
        return isNaN(monto) ? 0 : monto;
      }
      return 0;
    }
    // Sumar todos los pagos del historial
    return estudiante.pagos.reduce((total, pago) => {
      const montoAbonado = typeof pago.montoAbonado === 'string'
        ? parseFloat(pago.montoAbonado)
        : Number(pago.montoAbonado);
      return total + (isNaN(montoAbonado) ? 0 : montoAbonado);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header activeTab="admin" />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Título */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-black">Gestión de Pagos</h1>
            <p className="text-gray-600 mt-2">
              Lista de estudiantes que han subido comprobante de pago
            </p>
          </div>

          {/* Error al cargar */}
          {error && (
            <div className="mb-6">
              <Alert type="error" title="Error al cargar estudiantes" message={error} />
            </div>
          )}

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <p className="mt-2 text-gray-600">Cargando estudiantes...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-red-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Nombre del Estudiante
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Módulo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Generación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Abono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                        Monto Total a Pagar
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estudiantes && estudiantes.length > 0 ? (
                      estudiantes.map((estudiante) => {
                        const abono = calcularAbono(estudiante);
                        // Prisma puede devolver Decimal como string o number
                        const montoTotal = typeof estudiante.modulo.monto === 'string'
                          ? parseFloat(estudiante.modulo.monto)
                          : Number(estudiante.modulo.monto);
                        
                        return (
                          <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {estudiante.nombre}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{estudiante.modulo.nombre}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{estudiante.generacion}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(abono)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(montoTotal)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleVerificar(estudiante)}
                              >
                                Verificar
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <p className="text-gray-500">No hay estudiantes con comprobantes subidos</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de verificación */}
      <ModalVerificacion
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudianteNombre={selectedEstudiante?.nombre}
        estudianteGeneracion={selectedEstudiante?.generacion}
        comprobante={selectedEstudiante?.comprobantes?.[0]}
      />
    </div>
  );
}
