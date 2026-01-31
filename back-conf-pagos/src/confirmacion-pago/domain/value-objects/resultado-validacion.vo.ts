import type { PagoRegistrado } from './pago-registrado.vo';

export interface ResultadoValidacion {
  readonly valido: boolean;
  readonly mensaje: string;
  readonly datosExtraidos?: {
    readonly numeroTransaccion: string;
    readonly monto: number;
    readonly fecha?: string;
    readonly nombreCuentaDestino?: string;
  };
  readonly coincidenciaExcel?: PagoRegistrado;
  readonly error?: string;
}
