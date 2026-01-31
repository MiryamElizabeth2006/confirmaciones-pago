/**
 * Constantes de la aplicación
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  OPCIONES: '/confirmacion-pago/opciones',
  VALIDAR: '/confirmacion-pago/validar',
  VALIDAR_JSON: '/confirmacion-pago/validar-json',
} as const;

/**
 * Límites de validación del frontend (deben coincidir con el backend)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
