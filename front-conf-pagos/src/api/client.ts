/**
 * Cliente HTTP centralizado para todas las llamadas al backend.
 * Usa fetch nativo y maneja errores de forma consistente.
 */

import { API_BASE_URL } from '@/utils/constants';
import { ApiError, NetworkError, parseHttpError } from '@/utils/errors';

/**
 * Configuración para las peticiones HTTP
 */
const DEFAULT_TIMEOUT = 60000; // 60 segundos (el procesamiento de imágenes puede tardar)

/**
 * Opciones de configuración para las peticiones
 */
interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Realiza una petición HTTP con manejo de errores centralizado
 */
async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Si la respuesta no es exitosa, parsear el error
    if (!response.ok) {
      const error = await parseHttpError(response);
      throw new ApiError(error.statusCode, error.message);
    }

    // Parsear la respuesta JSON
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Si es un error de aborto (timeout), es un error de red
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NetworkError(error);
    }

    // Si ya es un ApiError, re-lanzarlo
    if (error instanceof ApiError) {
      throw error;
    }

    // Cualquier otro error es un error de red
    throw new NetworkError(error);
  }
}

/**
 * Cliente API con métodos para cada endpoint
 */
export const apiClient = {
  /**
   * GET /confirmacion-pago/opciones
   * Obtiene las opciones para poblar los selects del formulario
   */
  async getOpciones() {
    return request<import('@/types/api').OpcionesSelect>('/confirmacion-pago/opciones', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * POST /confirmacion-pago/validar
   * Valida un pago enviando el formulario con multipart/form-data
   */
  async validarPago(data: {
    estudiante: string;
    generacion: string;
    comprobante: File;
  }) {
    const formData = new FormData();
    formData.append('estudiante', data.estudiante.trim());
    formData.append('generacion', data.generacion.trim());
    formData.append('comprobante', data.comprobante);

    return request<import('@/types/api').ResultadoValidacion>(
      '/confirmacion-pago/validar',
      {
        method: 'POST',
        body: formData,
        // No establecer Content-Type, el navegador lo hará automáticamente con el boundary
      },
    );
  },

  /**
   * POST /confirmacion-pago/validar-json
   * Alternativa para validar con imagen en base64 (útil para pruebas)
   */
  async validarPagoJson(data: {
    estudiante: string;
    generacion: string;
    comprobanteBase64: string;
  }) {
    return request<import('@/types/api').ResultadoValidacion>(
      '/confirmacion-pago/validar-json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estudiante: data.estudiante.trim(),
          generacion: data.generacion.trim(),
          comprobanteBase64: data.comprobanteBase64,
        }),
      },
    );
  },

  /**
   * GET /estudiantes/con-comprobantes
   * Obtiene estudiantes que tienen comprobantes subidos (para tabla ADMIN)
   */
  async getEstudiantesConComprobantes() {
    return request<import('@/types/api').EstudiantesConComprobantes>(
      '/estudiantes/con-comprobantes',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  },
};
