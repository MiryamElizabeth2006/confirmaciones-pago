/**
 * Utilidades de validación del frontend.
 * Estas validaciones deben coincidir con las del backend.
 */

import { GENERACIONES, type Generacion } from '@/types/api';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, type AllowedFileType } from './constants';

/**
 * Valida que un estudiante no esté vacío
 */
export function validateEstudiante(estudiante: string): string | null {
  const trimmed = estudiante.trim();
  if (!trimmed) {
    return 'Por favor seleccione un estudiante';
  }
  return null;
}

/**
 * Valida que un módulo sea válido
 */
export function validateModulo(modulo: string): string | null {
  const trimmed = modulo.trim();
  if (!trimmed) {
    return 'Por favor seleccione un módulo';
  }
  return null;
}

/**
 * Valida que se haya seleccionado un archivo
 */
export function validateFile(file: File | null): string | null {
  if (!file) {
    return 'Por favor seleccione una imagen del comprobante';
  }

  // Validar tipo de archivo
  if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
    return 'El archivo debe ser una imagen (JPEG, PNG o WebP)';
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return `El archivo es muy grande. Máximo ${maxSizeMB} MB`;
  }

  return null;
}

/**
 * Valida todos los campos del formulario
 */
export interface FormValidationErrors {
  estudiante?: string;
  modulo?: string;
  comprobante?: string;
}

export function validateForm(data: {
  estudiante: string;
  modulo: string;
  comprobante: File | null;
}): FormValidationErrors {
  const errors: FormValidationErrors = {};

  const estudianteError = validateEstudiante(data.estudiante);
  if (estudianteError) {
    errors.estudiante = estudianteError;
  }

  const moduloError = validateModulo(data.modulo);
  if (moduloError) {
    errors.modulo = moduloError;
  }

  const fileError = validateFile(data.comprobante);
  if (fileError) {
    errors.comprobante = fileError;
  }

  return errors;
}
