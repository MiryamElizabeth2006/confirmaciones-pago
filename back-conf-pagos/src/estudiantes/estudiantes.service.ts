import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EstudiantesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene todos los estudiantes con sus módulos
   */
  async obtenerTodos() {
    return this.prisma.estudiante.findMany({
      include: {
        modulo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  /**
   * Obtiene estudiantes que tienen comprobantes de pago subidos
   * Incluye información del módulo y comprobantes
   */
  async obtenerConComprobantes() {
    try {
      const estudiantes = await this.prisma.estudiante.findMany({
        where: {
          comprobantes: {
            some: {},
          },
        },
        include: {
          modulo: true,
          comprobantes: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1, // Solo el más reciente
          },
          pagos: {
            orderBy: {
              fechaAbono: 'desc',
            },
          },
        },
        orderBy: {
          nombre: 'asc',
        },
      });
      console.log(`[EstudiantesService] Encontrados ${estudiantes.length} estudiantes con comprobantes`);
      return estudiantes;
    } catch (error) {
      console.error('[EstudiantesService] Error al obtener estudiantes con comprobantes:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los nombres de los estudiantes para el select
   */
  async obtenerNombres() {
    const estudiantes = await this.prisma.estudiante.findMany({
      select: {
        nombre: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
    return estudiantes.map((e) => e.nombre);
  }

  /**
   * Obtiene un estudiante por su nombre
   */
  async obtenerPorNombre(nombre: string) {
    return this.prisma.estudiante.findFirst({
      where: {
        nombre: nombre,
      },
      include: {
        modulo: true,
      },
    });
  }

  /**
   * Guarda un comprobante de pago en la base de datos
   */
  async guardarComprobante(data: {
    estudianteId: string;
    moduloId: string;
    urlImagen: string; // Base64 de la imagen
    numeroTransaccion?: string;
    fechaPago: Date;
    monto: number;
    cuentaDestino?: string;
    documento?: string;
  }) {
    return this.prisma.comprobantePago.create({
      data: {
        estudianteId: data.estudianteId,
        moduloId: data.moduloId,
        urlImagen: data.urlImagen,
        numeroTransaccion: data.numeroTransaccion,
        fechaPago: data.fechaPago,
        monto: data.monto,
        cuentaDestino: data.cuentaDestino,
        documento: data.documento,
        confirmacionPago: 'PENDIENTE',
      },
    });
  }

  /**
   * Test de conexión básica a la base de datos
   */
  async testConnection() {
    // Hacer una consulta simple para verificar la conexión
    await this.prisma.$queryRaw`SELECT 1`;
  }

  /**
   * Cuenta el total de estudiantes
   */
  async countEstudiantes() {
    return this.prisma.estudiante.count();
  }

  /**
   * Cuenta el total de comprobantes
   */
  async countComprobantes() {
    return this.prisma.comprobantePago.count();
  }

  /**
   * Cuenta el total de módulos
   */
  async countModulos() {
    return this.prisma.modulo.count();
  }

  /**
   * Obtiene un estudiante de ejemplo
   */
  async getEstudianteEjemplo() {
    return this.prisma.estudiante.findFirst({
      include: {
        modulo: true,
      },
    });
  }
}
