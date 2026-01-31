/**
 * Utilidades para almacenar resultados de validación localmente
 * Esto permite que el ADMIN vea los resultados sin tener que re-validar
 */

import type { ResultadoValidacion } from '@/types/api';

export interface ValidacionGuardada {
  id: string;
  estudiante: string;
  generacion: string;
  fechaSubida: string;
  resultado: ResultadoValidacion;
}

const STORAGE_KEY = 'validaciones_pagos';

/**
 * Guarda un resultado de validación
 */
export function guardarValidacion(
  estudiante: string,
  generacion: string,
  resultado: ResultadoValidacion,
): ValidacionGuardada {
  const validacion: ValidacionGuardada = {
    id: `${estudiante}_${generacion}_${Date.now()}`,
    estudiante,
    generacion,
    fechaSubida: new Date().toISOString(),
    resultado,
  };

  const validaciones = obtenerTodasLasValidaciones();
  validaciones.push(validacion);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(validaciones));

  return validacion;
}

/**
 * Obtiene todas las validaciones guardadas
 */
export function obtenerTodasLasValidaciones(): ValidacionGuardada[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene la validación más reciente de un estudiante
 */
export function obtenerValidacionPorEstudiante(
  estudiante: string,
  generacion: string,
): ValidacionGuardada | null {
  const validaciones = obtenerTodasLasValidaciones();
  const filtradas = validaciones.filter(
    (v) => v.estudiante === estudiante && v.generacion === generacion,
  );
  
  if (filtradas.length === 0) return null;
  
  // Retornar la más reciente
  return filtradas.sort((a, b) => 
    new Date(b.fechaSubida).getTime() - new Date(a.fechaSubida).getTime()
  )[0];
}

/**
 * Limpia todas las validaciones (útil para testing)
 */
export function limpiarValidaciones(): void {
  localStorage.removeItem(STORAGE_KEY);
}
