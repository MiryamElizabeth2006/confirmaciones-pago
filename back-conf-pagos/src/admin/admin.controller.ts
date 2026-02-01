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
   * GET /admin/resumen-estudiantes
   * Lista todos los estudiantes. Monto = suma de montos extraídos de los comprobantes (imagen).
   * Saldo faltante = monto del módulo (ej. 287.50) − total abonado. Sin comprobantes: monto=0, saldo=287.50, estado=No realizado.
   */
  @Get('resumen-estudiantes')
  async resumenEstudiantes() {
    const estudiantes = await this.prisma.estudiante.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        modulo: { select: { id: true, nombre: true, monto: true } },
      },
    });

    const estudianteIds = estudiantes.map((e) => e.id);

    const [comprobantesConMonto, comprobantesPorEstudiante, ultimoComprobantePorEstudiante] =
      await Promise.all([
        this.prisma.comprobantePago.findMany({
          where: { estudianteId: { in: estudianteIds } },
          select: { estudianteId: true, monto: true },
        }),
        this.prisma.comprobantePago.groupBy({
          by: ['estudianteId'],
          _count: true,
        }),
        this.prisma.comprobantePago.findMany({
          where: { estudianteId: { in: estudianteIds } },
          orderBy: { createdAt: 'desc' },
          select: {
            estudianteId: true,
            id: true,
            numeroTransaccion: true,
            urlImagen: true,
            fechaPago: true,
            monto: true,
          },
        }),
      ]);

    const totalAbonadoMap = new Map<string, number>();
    for (const c of comprobantesConMonto) {
      const prev = totalAbonadoMap.get(c.estudianteId) ?? 0;
      totalAbonadoMap.set(c.estudianteId, prev + Number(c.monto));
    }

    const countMap = new Map<string, number>();
    for (const c of comprobantesPorEstudiante) {
      countMap.set(c.estudianteId, c._count);
    }

    const ultimoComprobanteMap = new Map<
      string,
      { id: string; numeroTransaccion: string | null; urlImagen: string; fechaPago: Date; monto: number }
    >();
    for (const c of ultimoComprobantePorEstudiante) {
      if (!ultimoComprobanteMap.has(c.estudianteId)) {
        ultimoComprobanteMap.set(c.estudianteId, {
          id: c.id,
          numeroTransaccion: c.numeroTransaccion,
          urlImagen: c.urlImagen,
          fechaPago: c.fechaPago,
          monto: Number(c.monto),
        });
      }
    }

    const rows = estudiantes.map((e) => {
      const montoModulo = Number(e.modulo.monto);
      const totalAbonado = totalAbonadoMap.get(e.id) ?? 0;
      const saldoFaltante = Math.max(0, montoModulo - totalAbonado);
      const cantidadComprobantes = countMap.get(e.id) ?? 0;
      let estado: 'NO_REALIZADO' | 'PENDIENTE' | 'REALIZADO' = 'NO_REALIZADO';
      if (cantidadComprobantes === 0) {
        estado = 'NO_REALIZADO';
      } else if (saldoFaltante > 0) {
        estado = 'PENDIENTE';
      } else {
        estado = 'REALIZADO';
      }

      const ultimo = ultimoComprobanteMap.get(e.id);

      return {
        estudianteId: e.id,
        estudiante: e.nombre,
        cedula: e.cedula,
        generacion: e.generacion,
        modulo: e.modulo.nombre,
        montoModulo,
        monto: totalAbonado,
        saldoFaltante,
        cantidadComprobantes,
        estado,
        numeroTransaccion: ultimo?.numeroTransaccion ?? null,
        urlImagen: ultimo?.urlImagen ?? null,
        fechaPago: ultimo?.fechaPago ?? null,
      };
    });

    return rows;
  }

  /**
   * GET /admin/estadisticas
   * Resumen para el dashboard (totales por estado calculado).
   */
  @Get('estadisticas')
  async estadisticas() {
    const resumen = await this.resumenEstudiantes();
    let pendientes = 0;
    let realizados = 0;
    let noRealizados = 0;
    for (const r of resumen) {
      if (r.estado === 'PENDIENTE') pendientes++;
      else if (r.estado === 'REALIZADO') realizados++;
      else noRealizados++;
    }
    return {
      total: resumen.length,
      pendientes,
      realizados,
      noRealizados,
    };
  }
}
