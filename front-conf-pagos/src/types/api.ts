/**
 * Tipos TypeScript basados en el backend.
 * Estos tipos deben coincidir exactamente con los value objects del backend.
 */

/**
 * Respuesta del endpoint GET /confirmacion-pago/opciones
 */
export interface OpcionesSelect {
  readonly estudiantes: string[];
  readonly generaciones: readonly string[];
}

/**
 * Datos extraídos del comprobante (parte de ResultadoValidacion)
 */
export interface DatosExtraidos {
  readonly numeroTransaccion: string;
  readonly monto: number;
  readonly fecha?: string;
  readonly nombreCuentaDestino?: string;
}

/**
 * Registro de pago del Excel (coincidencia encontrada)
 */
export interface PagoRegistrado {
  readonly estudiante: string;
  readonly generacion: string;
  readonly numeroTransaccion: string;
  readonly monto: number;
}

/**
 * Respuesta del endpoint POST /confirmacion-pago/validar
 */
export interface ResultadoValidacion {
  readonly valido: boolean;
  readonly mensaje: string;
  readonly datosExtraidos?: DatosExtraidos;
  readonly coincidenciaExcel?: PagoRegistrado;
  readonly error?: string;
}

/**
 * Generaciones válidas (debe coincidir con el backend)
 */
export const GENERACIONES = [
  'generacion 1',
  'generacion 2',
  'generacion 3',
  'generacion 4',
  'generacion 5',
] as const;

export type Generacion = (typeof GENERACIONES)[number];

/**
 * Error HTTP estándar de NestJS
 */
export interface HttpError {
  readonly statusCode: number;
  readonly message: string;
  readonly error: string;
}
