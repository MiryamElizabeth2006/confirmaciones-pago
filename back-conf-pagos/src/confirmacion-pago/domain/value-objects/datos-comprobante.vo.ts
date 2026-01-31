/**
 * Datos extraídos de un comprobante de pago (imagen).
 * Soporta dos tipos: recibo físico (Documento) y transferencia digital (Comprobante).
 * - numeroTransaccion: número junto a "Documento" (físico) o "Comprobante" (digital) → se compara con columna Documento del Excel.
 * - monto: valor del pago → se compara con columna Monto del Excel.
 * - fecha, nombreCuentaDestino: solo para registro (no intervienen en la comparación).
 */
export interface DatosComprobante {
  readonly numeroTransaccion: string;
  readonly monto: number;
  readonly fecha?: string;
  readonly nombreCuentaDestino?: string;
}
