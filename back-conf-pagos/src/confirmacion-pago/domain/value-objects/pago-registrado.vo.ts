/**
 * Registro de un pago esperado (fila del Excel).
 * La comparación se hace por el nombre del estudiante (seleccionado en el front),
 * generación, número de transacción y monto extraídos del comprobante.
 */
export interface PagoRegistrado {
  readonly estudiante: string;
  readonly generacion: string;
  readonly numeroTransaccion: string;
  readonly monto: number;
}
