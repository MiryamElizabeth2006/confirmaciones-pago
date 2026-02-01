/**
 * Servicio para obtener estudiantes desde Prisma
 */

import { apiClient } from '@/api/client';
import type { EstudiantesConComprobantes } from '@/types/api';

export class EstudiantesService {
  /**
   * Obtiene estudiantes que tienen comprobantes subidos (para tabla ADMIN)
   */
  async obtenerConComprobantes(): Promise<EstudiantesConComprobantes> {
    return apiClient.getEstudiantesConComprobantes();
  }
}

export const estudiantesService = new EstudiantesService();
