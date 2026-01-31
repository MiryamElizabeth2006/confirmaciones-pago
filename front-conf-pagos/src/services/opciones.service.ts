/**
 * Servicio para obtener opciones del backend
 */

import { apiClient } from '@/api/client';
import type { OpcionesSelect } from '@/types/api';

export class OpcionesService {
  /**
   * Obtiene las opciones para poblar los selects del formulario
   */
  async obtenerOpciones(): Promise<OpcionesSelect> {
    return apiClient.getOpciones();
  }
}

export const opcionesService = new OpcionesService();
