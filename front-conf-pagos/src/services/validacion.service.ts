/**
 * Servicio para validar pagos
 */

import { apiClient } from '@/api/client';
import type { ResultadoValidacion } from '@/types/api';

export interface ValidarPagoParams {
  estudiante: string;
  modulo: string;
  comprobante: File;
}

export class ValidacionService {
  /**
   * Valida un pago comparando el comprobante con los registros del Excel
   */
  async validarPago(params: ValidarPagoParams): Promise<ResultadoValidacion> {
    return apiClient.validarPago({
      estudiante: params.estudiante,
      modulo: params.modulo,
      comprobante: params.comprobante,
    });
  }
}

export const validacionService = new ValidacionService();
