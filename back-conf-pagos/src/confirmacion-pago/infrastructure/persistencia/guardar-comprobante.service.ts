import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { EstadoConfirmacion } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';

const COMPROBANTES_DIR = 'data/comprobantes';

/**
 * Guarda la imagen del comprobante en disco y crea el registro en ComprobantePago.
 */
@Injectable()
export class GuardarComprobanteService {
  constructor(private readonly prisma: PrismaService) {}

  async ejecutar(params: {
    estudianteId: string;
    moduloId: string;
    imagenBuffer: Buffer;
    mimeType: string;
    numeroTransaccion: string;
    monto: number;
    fechaExtraida?: string;
    nombreCuentaDestino?: string;
    confirmacionPago: EstadoConfirmacion;
  }): Promise<{ id: string }> {
    const id = randomUUID();
    const ext = this.extensionPorMime(params.mimeType);
    const dir = path.resolve(process.cwd(), COMPROBANTES_DIR);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${id}${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, params.imagenBuffer);

    const fechaPago = this.parsearFecha(params.fechaExtraida);

    await this.prisma.comprobantePago.create({
      data: {
        id,
        estudianteId: params.estudianteId,
        moduloId: params.moduloId,
        urlImagen: `comprobantes/${filename}`,
        numeroTransaccion: params.numeroTransaccion,
        documento: params.numeroTransaccion,
        fechaPago,
        monto: params.monto,
        cuentaDestino: params.nombreCuentaDestino ?? null,
        confirmacionPago: params.confirmacionPago,
      },
    });

    return { id };
  }

  private extensionPorMime(mime: string): string {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    return '.jpg';
  }

  private parsearFecha(fechaStr?: string): Date {
    if (!fechaStr || fechaStr.trim() === '') return new Date();
    // Intentar formato "2025/DIC/02 14H27" o ISO
    const iso = fechaStr.replace(/(\d{4})\/([A-Za-z]+)\/(\d{2})\s*(\d{2})H(\d{2})/, (_, y, m, d, h, min) => {
      const meses: Record<string, string> = {
        ENE: '01', FEB: '02', MAR: '03', ABR: '04', MAY: '05', JUN: '06',
        JUL: '07', AGO: '08', SEP: '09', OCT: '10', NOV: '11', DIC: '12',
      };
      const mes = meses[m?.toUpperCase().slice(0, 3)] ?? '01';
      return `${y}-${mes}-${d}T${h}:${min}:00`;
    });
    const d = new Date(iso);
    return isNaN(d.getTime()) ? new Date() : d;
  }
}
