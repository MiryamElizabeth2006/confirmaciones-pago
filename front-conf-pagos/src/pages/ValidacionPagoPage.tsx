/**
 * Página principal para validar pagos - Diseño moderno y profesional
 */

import { useState, FormEvent } from 'react';
import { useOpciones } from '@/hooks/useOpciones';
import { useValidarPago } from '@/hooks/useValidarPago';
import { validateForm, type FormValidationErrors } from '@/utils/validations';
import { guardarValidacion } from '@/utils/storage';
import { Select } from '@/components/Select';
import { DragDropFileInput } from '@/components/DragDropFileInput';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { Header } from '@/components/Header';

export function ValidacionPagoPage() {
  const { data: opciones, loading: loadingOpciones, error: errorOpciones } = useOpciones();
  const { status, data: resultado, error: errorValidacion, validar, reset } = useValidarPago();
  const [estudiante, setEstudiante] = useState('');
  const [modulo, setModulo] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [notas, setNotas] = useState('');
  const [errors, setErrors] = useState<FormValidationErrors>({});

  const isLoading = loadingOpciones || status === 'loading';
  const canSubmit = !isLoading && estudiante && modulo && comprobante;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulario
    const validationErrors = validateForm({
      estudiante,
      modulo,
      comprobante,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Limpiar errores previos
    setErrors({});

    // Validar pago
    try {
      const resultado = await validar({
        estudiante,
        modulo,
        comprobante: comprobante!,
      });
      
      // Guardar el resultado para que el ADMIN pueda verlo
      // Usar módulo como generación para compatibilidad con storage
      if (resultado) {
        guardarValidacion(estudiante, modulo, resultado);
      }
    } catch (error) {
      // El error ya está manejado en el hook
      console.error('Error al validar pago:', error);
    }
  };

  const handleReset = () => {
    setEstudiante('');
    setModulo('');
    setComprobante(null);
    setNotas('');
    setErrors({});
    reset();
  };

  // Preparar opciones para los selects
  const estudianteOptions =
    opciones?.estudiantes.map((est) => ({ value: est, label: est })) || [];
  const moduloOptions =
    opciones?.modulos.map((mod) => ({ value: mod, label: mod })) || [];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header activeTab="subir" />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10">
            {/* Título */}
            <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">
              Subir Comprobante de Pago
            </h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              Completa los campos para registrar tu pago en el sistema.
            </p>

            {/* Error al cargar opciones */}
            {errorOpciones && (
              <div className="mb-6">
                <Alert
                  type="error"
                  title="Error al cargar opciones"
                  message={errorOpciones}
                  onClose={() => window.location.reload()}
                />
              </div>
            )}

            {/* Formulario */}
            {!errorOpciones && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campos en grid de 2 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Módulo */}
                  <Select
                    label="Módulo"
                    value={modulo}
                    onChange={(e) => {
                      setModulo(e.target.value);
                      if (errors.modulo) {
                        setErrors({ ...errors, modulo: undefined });
                      }
                    }}
                    options={moduloOptions}
                    placeholder="Selecciona un módulo"
                    required
                    disabled={isLoading || !opciones}
                    error={errors.modulo}
                    className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />

                  {/* Estudiante */}
                  <Select
                    label="Nombre del Estudiante"
                    value={estudiante}
                    onChange={(e) => {
                      setEstudiante(e.target.value);
                      if (errors.estudiante) {
                        setErrors({ ...errors, estudiante: undefined });
                      }
                    }}
                    options={estudianteOptions}
                    placeholder="Selecciona un estudiante"
                    required
                    disabled={isLoading || !opciones}
                    error={errors.estudiante}
                    className="bg-white border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                {/* Área de drag & drop para comprobante */}
                <div>
                  <DragDropFileInput
                    label="Comprobante (Imagen o PDF)"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onFileChange={(file) => {
                      setComprobante(file);
                      if (errors.comprobante) {
                        setErrors({ ...errors, comprobante: undefined });
                      }
                    }}
                    required
                    disabled={isLoading}
                    error={errors.comprobante}
                  />
                </div>


                {/* Error de validación */}
                {errorValidacion && (
                  <Alert
                    type="error"
                    title="Error al validar"
                    message={errorValidacion}
                  />
                )}

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={status === 'loading'}
                    disabled={!canSubmit}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    {status === 'loading' ? 'Validando...' : 'Subir Recibo'}
                  </Button>
                </div>
              </form>
            )}

            {/* Mensaje de confirmación para estudiante (sin mostrar detalles de verificación) */}
            {status === 'success' && resultado && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <Alert
                  type={resultado.valido ? 'success' : 'error'}
                  title={resultado.valido ? 'Comprobante Subido' : 'Error al Subir Comprobante'}
                  message={
                    resultado.valido
                      ? 'Tu comprobante ha sido recibido correctamente. Será verificado por el administrador.'
                      : resultado.mensaje
                  }
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
