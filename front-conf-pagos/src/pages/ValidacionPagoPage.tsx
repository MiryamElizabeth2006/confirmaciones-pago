/**
 * Página principal para validar pagos
 */

import { useState, FormEvent } from 'react';
import { useOpciones } from '@/hooks/useOpciones';
import { useValidarPago } from '@/hooks/useValidarPago';
import { validateForm, type FormValidationErrors } from '@/utils/validations';
import { Select } from '@/components/Select';
import { FileInput } from '@/components/FileInput';
import { Button } from '@/components/Button';
import { Alert } from '@/components/Alert';
import { ResultadoValidacionComponent } from '@/components/ResultadoValidacion';

export function ValidacionPagoPage() {
  const { data: opciones, loading: loadingOpciones, error: errorOpciones } = useOpciones();
  const { status, data: resultado, error: errorValidacion, validar, reset } = useValidarPago();

  const [estudiante, setEstudiante] = useState('');
  const [generacion, setGeneracion] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormValidationErrors>({});

  const isLoading = loadingOpciones || status === 'loading';
  const canSubmit = !isLoading && estudiante && generacion && comprobante;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validar formulario
    const validationErrors = validateForm({
      estudiante,
      generacion,
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
      await validar({
        estudiante,
        generacion,
        comprobante: comprobante!,
      });
    } catch (error) {
      // El error ya está manejado en el hook
      console.error('Error al validar pago:', error);
    }
  };

  const handleReset = () => {
    setEstudiante('');
    setGeneracion('');
    setComprobante(null);
    setErrors({});
    reset();
  };

  // Preparar opciones para los selects
  const estudianteOptions =
    opciones?.estudiantes.map((est) => ({ value: est, label: est })) || [];
  const generacionOptions =
    opciones?.generaciones.map((gen) => ({ value: gen, label: gen })) || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Confirmación de Pago
          </h1>

          {/* Error al cargar opciones */}
          {errorOpciones && (
            <Alert
              type="error"
              title="Error al cargar opciones"
              message={errorOpciones}
              onClose={() => window.location.reload()}
            />
          )}

          {/* Formulario */}
          {!errorOpciones && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select de Estudiante */}
              <Select
                label="Estudiante"
                value={estudiante}
                onChange={(e) => {
                  setEstudiante(e.target.value);
                  if (errors.estudiante) {
                    setErrors({ ...errors, estudiante: undefined });
                  }
                }}
                options={estudianteOptions}
                placeholder="Seleccione un estudiante"
                required
                disabled={isLoading || !opciones}
                error={errors.estudiante}
              />

              {/* Select de Generación */}
              <Select
                label="Generación"
                value={generacion}
                onChange={(e) => {
                  setGeneracion(e.target.value);
                  if (errors.generacion) {
                    setErrors({ ...errors, generacion: undefined });
                  }
                }}
                options={generacionOptions}
                placeholder="Seleccione una generación"
                required
                disabled={isLoading || !opciones}
                error={errors.generacion}
              />

              {/* Input de Archivo */}
              <FileInput
                label="Comprobante de Pago"
                accept="image/jpeg,image/png,image/webp"
                onFileChange={(file) => {
                  setComprobante(file);
                  if (errors.comprobante) {
                    setErrors({ ...errors, comprobante: undefined });
                  }
                }}
                required
                disabled={isLoading}
                error={errors.comprobante}
                showPreview={true}
              />

              {/* Error de validación */}
              {errorValidacion && (
                <Alert
                  type="error"
                  title="Error al validar"
                  message={errorValidacion}
                />
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={status === 'loading'}
                  disabled={!canSubmit}
                  className="flex-1"
                >
                  Validar Pago
                </Button>
                {(status === 'success' || status === 'error') && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    Nuevo Pago
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* Resultado de la validación */}
          {status === 'success' && resultado && (
            <div className="mt-8">
              <ResultadoValidacionComponent resultado={resultado} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
