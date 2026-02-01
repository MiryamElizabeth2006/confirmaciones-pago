/**
 * Tipos TypeScript basados en el backend.
 * Estos tipos deben coincidir exactamente con los value objects del backend.
 */

/**
 * Respuesta del endpoint GET /confirmacion-pago/opciones
 */
export interface OpcionesSelect {
  readonly estudiantes: string[];
  readonly modulos: string[];
  readonly generaciones?: readonly string[]; // Mantener para compatibilidad
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

/**
 * Tipos para los nuevos endpoints de Prisma
 */

export interface Modulo {
  readonly id: string;
  readonly nombre: string;
  readonly monto: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ComprobantePago {
  readonly id: string;
  readonly estudianteId: string;
  readonly moduloId: string;
  readonly urlImagen: string;
  readonly numeroTransaccion?: string;
  readonly fechaPago: string;
  readonly monto: number;
  readonly cuentaDestino?: string;
  readonly confirmacionPago: 'PENDIENTE' | 'REALIZADO' | 'NO_REALIZADO';
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly documento?: string;
}

export interface HistorialPago {
  readonly id: string;
  readonly estudianteId: string;
  readonly moduloId: string;
  readonly comprobanteId: string;
  readonly montoAbonado: number;
  readonly fechaAbono: string;
  readonly createdAt: string;
}

export interface Estudiante {
  readonly id: string;
  readonly cedula: string;
  readonly nombre: string;
  readonly generacion: string;
  readonly createdAt: string;
  readonly moduloId: string;
  readonly updatedAt: string;
  readonly modulo: Modulo;
  readonly comprobantes?: ComprobantePago[];
  readonly pagos?: HistorialPago[];
}

/**
 * Respuesta del endpoint GET /estudiantes/con-comprobantes
 */
export type EstudiantesConComprobantes = Estudiante[];
