import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface OpcionModulo {
  id: string;
  nombre: string;
}

export interface OpcionEstudiante {
  id: string;
  nombre: string;
  generacion: string;
}

export interface OpcionesSelectDb {
  modulos: OpcionModulo[];
  estudiantes: OpcionEstudiante[];
}

/**
 * Caso de uso: obtener opciones para los selects del front (módulos y estudiantes desde la base de datos).
 */
@Injectable()
export class ObtenerOpcionesDbUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(): Promise<OpcionesSelectDb> {
    const [modulos, estudiantes] = await Promise.all([
      this.prisma.modulo.findMany({
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true },
      }),
      this.prisma.estudiante.findMany({
        orderBy: { nombre: 'asc' },
        select: { id: true, nombre: true, generacion: true },
      }),
    ]);

    return {
      modulos: modulos.map((m) => ({ id: m.id, nombre: m.nombre })),
      estudiantes: estudiantes.map((e) => ({
        id: e.id,
        nombre: e.nombre,
        generacion: e.generacion,
      })),
    };
  }
}
