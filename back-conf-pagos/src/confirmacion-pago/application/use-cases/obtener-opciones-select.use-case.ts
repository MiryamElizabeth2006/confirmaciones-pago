import { Injectable, Inject } from '@nestjs/common';
import type { LeerPagosRegistradosPort } from '../../domain/ports/leer-pagos-registrados.port';
import { GENERACIONES } from '../../domain/constants/generaciones';
import { LEER_PAGOS_REGISTRADOS_PORT } from '../tokens';

export interface OpcionesSelect {
  estudiantes: string[];
  generaciones: readonly string[];
}

/**
 * Caso de uso: obtener opciones para los selects del front (estudiantes desde Excel, generaciones fijas).
 */
@Injectable()
export class ObtenerOpcionesSelectUseCase {
  constructor(
    @Inject(LEER_PAGOS_REGISTRADOS_PORT)
    private readonly leerPagos: LeerPagosRegistradosPort,
  ) {}

  async ejecutar(): Promise<OpcionesSelect> {
    const registros = await this.leerPagos.leerTodos();
    const estudiantes = [
      ...new Set(registros.map((p) => p.estudiante).filter(Boolean)),
    ].sort();
    return {
      estudiantes,
      generaciones: GENERACIONES,
    };
  }
}
