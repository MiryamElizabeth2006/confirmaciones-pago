/**
 * Utilidades para manejo de errores
 */

import type { HttpError } from '@/types/api';

/**
 * Error personalizado para errores HTTP
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Error de red (sin conexión, timeout, etc.)
 */
export class NetworkError extends Error {
  constructor(public readonly originalError?: unknown) {
    super('Error de conexión. Por favor, verifique su conexión a internet e intente nuevamente.');
    this.name = 'NetworkError';
  }
}

/**
 * Parsea un error HTTP de NestJS
 */
export function parseHttpError(response: Response): Promise<HttpError> {
  return response.json().catch(() => ({
    statusCode: response.status,
    message: response.statusText || 'Error desconocido',
    error: 'Unknown Error',
  }));
}

/**
 * Convierte un error en un mensaje amigable para el usuario
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof NetworkError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.';
}
