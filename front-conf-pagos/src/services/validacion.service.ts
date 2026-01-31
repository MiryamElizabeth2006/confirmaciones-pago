/**
 * Servicio para validar pagos
 */

import { apiClient } from '@/api/client';
import type { ResultadoValidacion } from '@/types/api';

export interface ValidarPagoParams {
  estudiante: string;
  generacion: string;
  comprobante: File;
}

export class ValidacionService {
  /**
   * Valida un pago comparando el comprobante con los registros del Excel
   */
  async validarPago(params: ValidarPagoParams): Promise<ResultadoValidacion> {
    return apiClient.validarPago({
      estudiante: params.estudiante,
      generacion: params.generacion,
      comprobante: params.comprobante,
    });
  }
}

export const validacionService = new ValidacionService();
