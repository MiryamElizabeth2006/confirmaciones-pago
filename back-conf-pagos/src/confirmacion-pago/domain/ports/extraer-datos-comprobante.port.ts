import type { DatosComprobante } from '../value-objects/datos-comprobante.vo';

/**
 * Puerto (driven): extracción de datos del comprobante desde una imagen.
 * Implementado por AWS Textract (por defecto) u OpenAI Vision. El dominio no conoce el proveedor.
 */
export interface ExtraerDatosComprobantePort {
  extraer(imagenBuffer: Buffer): Promise<DatosComprobante>;
}
