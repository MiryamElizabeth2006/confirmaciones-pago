/**
 * Página de ADMIN con tabla de estudiantes y verificación de comprobantes
 */

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { ModalVerificacion } from '@/components/ModalVerificacion';
import { MOCK_ESTUDIANTES_PAGOS, type EstudiantePago } from '@/utils/mockData';
import { formatCurrency } from '@/utils/formatters';

export function AdminPage() {
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudiantePago | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVerificar = (estudiante: EstudiantePago) => {
    setSelectedEstudiante(estudiante);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEstudiante(null);
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

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
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
                  {MOCK_ESTUDIANTES_PAGOS.map((estudiante) => (
                    <tr key={estudiante.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {estudiante.nombreEstudiante}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{estudiante.modulo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{estudiante.generacion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(estudiante.abono)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(estudiante.montoTotal)}
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mensaje si no hay datos */}
            {MOCK_ESTUDIANTES_PAGOS.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay estudiantes con comprobantes subidos</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de verificación */}
      <ModalVerificacion
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudianteNombre={selectedEstudiante?.nombreEstudiante}
        estudianteGeneracion={selectedEstudiante?.generacion}
      />
    </div>
  );
}
