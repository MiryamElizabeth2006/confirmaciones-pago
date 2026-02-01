import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from './admin.guard';
import { EstadoConfirmacion } from '@prisma/client';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/comprobantes
   * Lista comprobantes con estudiante y módulo. Query: estado (PENDIENTE | REALIZADO | NO_REALIZADO).
   */
  @Get('comprobantes')
  async listarComprobantes(
    @Query('estado') estado?: string,
  ) {
    const where =
      estado && ['PENDIENTE', 'REALIZADO', 'NO_REALIZADO'].includes(estado)
        ? { confirmacionPago: estado as EstadoConfirmacion }
        : {};

    const comprobantes = await this.prisma.comprobantePago.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        estudiante: { select: { id: true, nombre: true, cedula: true, generacion: true } },
        modulo: { select: { id: true, nombre: true, monto: true } },
      },
    });

    return comprobantes.map((c) => ({
      id: c.id,
      estudiante: c.estudiante.nombre,
      estudianteCedula: c.estudiante.cedula,
      modulo: c.modulo.nombre,
      montoModulo: Number(c.modulo.monto),
      numeroTransaccion: c.numeroTransaccion,
      monto: Number(c.monto),
      fechaPago: c.fechaPago,
      cuentaDestino: c.cuentaDestino,
      confirmacionPago: c.confirmacionPago,
      urlImagen: c.urlImagen,
      createdAt: c.createdAt,
    }));
  }

  /**
   * PATCH /admin/comprobantes/:id/confirmacion
   * Actualiza el estado de confirmación de un comprobante.
   */
  @Patch('comprobantes/:id/confirmacion')
  async actualizarConfirmacion(
    @Param('id') id: string,
    @Body() body: { confirmacionPago: EstadoConfirmacion },
  ) {
    const estado = body.confirmacionPago;
    if (!['PENDIENTE', 'REALIZADO', 'NO_REALIZADO'].includes(estado)) {
      throw new BadRequestException(
        'confirmacionPago debe ser PENDIENTE, REALIZADO o NO_REALIZADO.',
      );
    }

    const comprobante = await this.prisma.comprobantePago.update({
      where: { id },
      data: { confirmacionPago: estado as EstadoConfirmacion },
      include: {
        estudiante: { select: { nombre: true } },
        modulo: { select: { nombre: true } },
      },
    });

    return {
      id: comprobante.id,
      confirmacionPago: comprobante.confirmacionPago,
      estudiante: comprobante.estudiante.nombre,
      modulo: comprobante.modulo.nombre,
    };
  }

  /**
   * GET /admin/estadisticas
   * Resumen para el dashboard (totales por estado).
   */
  @Get('estadisticas')
  async estadisticas() {
    const [total, pendientes, realizados, noRealizados] = await Promise.all([
      this.prisma.comprobantePago.count(),
      this.prisma.comprobantePago.count({ where: { confirmacionPago: 'PENDIENTE' } }),
      this.prisma.comprobantePago.count({ where: { confirmacionPago: 'REALIZADO' } }),
      this.prisma.comprobantePago.count({ where: { confirmacionPago: 'NO_REALIZADO' } }),
    ]);

    return {
      total,
      pendientes,
      realizados,
      noRealizados,
    };
  }
}
