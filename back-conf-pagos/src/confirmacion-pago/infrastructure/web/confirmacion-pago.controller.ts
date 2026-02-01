import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ValidarPagoUseCase } from '../../application/use-cases/validar-pago.use-case';
import { ObtenerOpcionesDbUseCase } from '../../application/use-cases/obtener-opciones-db.use-case';
import { PrismaService } from '../../../prisma/prisma.service';
import { GuardarComprobanteService } from '../persistencia/guardar-comprobante.service';
import { EstadoConfirmacion } from '@prisma/client';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Adaptador primario (driving): expone la API HTTP de confirmación de pagos.
 * - La comparación se hace por el nombre del estudiante (seleccionado en el front).
 * - Del comprobante se extraen solo: número de transacción (junto a "Comprobante") y monto.
 */
@Controller('confirmacion-pago')
export class ConfirmacionPagoController {
  constructor(
    private readonly validarPagoUseCase: ValidarPagoUseCase,
    private readonly obtenerOpcionesDbUseCase: ObtenerOpcionesDbUseCase,
    private readonly prisma: PrismaService,
    private readonly guardarComprobante: GuardarComprobanteService,
  ) {}

  @Get('opciones')
  async opciones() {
    return this.obtenerOpcionesDbUseCase.ejecutar();
  }

  @Post('validar')
  @UseInterceptors(
    FileInterceptor('comprobante', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_, file, cb) => {
        if (!file) {
          return cb(
            new BadRequestException('Falta el archivo del comprobante.'),
            false,
          );
        }
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Solo se permiten imágenes (JPEG, PNG, WebP).',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async validar(
    @Body() body: { moduloId?: string; estudianteId?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Debe enviar la imagen del comprobante.');
    }

    const moduloId = (body.moduloId ?? '').trim();
    const estudianteId = (body.estudianteId ?? '').trim();

    if (!moduloId) {
      throw new BadRequestException('Debe seleccionar un módulo.');
    }

    if (!estudianteId) {
      throw new BadRequestException('Debe seleccionar un estudiante.');
    }

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('Estudiante no encontrado.');
    }

    const resultado = await this.validarPagoUseCase.ejecutar(
      estudiante.nombre,
      estudiante.generacion,
      file.buffer,
    );

    if (resultado.datosExtraidos?.numeroTransaccion != null && resultado.datosExtraidos?.monto != null) {
      const confirmacion: EstadoConfirmacion = resultado.valido ? 'REALIZADO' : 'NO_REALIZADO';
      await this.guardarComprobante.ejecutar({
        estudianteId,
        moduloId,
        imagenBuffer: file.buffer,
        mimeType: file.mimetype,
        numeroTransaccion: resultado.datosExtraidos.numeroTransaccion,
        monto: resultado.datosExtraidos.monto,
        fechaExtraida: resultado.datosExtraidos.fecha,
        nombreCuentaDestino: resultado.datosExtraidos.nombreCuentaDestino,
        confirmacionPago: confirmacion,
      });
    }

    return resultado;
  }

  /**
   * POST /confirmacion-pago/validar-json
   * Alternativa para probar desde Insomnia con JSON: la imagen se envía en base64.
   * Body (application/json):
   * { "moduloId": "uuid", "estudianteId": "uuid", "comprobanteBase64": "data:image/jpeg;base64,..." }
   */
  @Post('validar-json')
  async validarJson(
    @Body()
    body: {
      moduloId?: string;
      estudianteId?: string;
      comprobanteBase64?: string;
    },
  ) {
    const estudianteId = (body.estudianteId ?? '').trim();
    const comprobanteBase64 = (body.comprobanteBase64 ?? '').trim();

    if (!body.moduloId?.trim()) {
      throw new BadRequestException('Debe seleccionar un módulo.');
    }

    if (!estudianteId) {
      throw new BadRequestException('Debe seleccionar un estudiante.');
    }

    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('Estudiante no encontrado.');
    }

    if (!comprobanteBase64) {
      throw new BadRequestException(
        'Debe enviar comprobanteBase64 con la imagen en base64.',
      );
    }

    const buffer = this.base64ToBuffer(comprobanteBase64);
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException(
        'comprobanteBase64 no es una cadena base64 válida.',
      );
    }

    return this.validarPagoUseCase.ejecutar(
      estudiante.nombre,
      estudiante.generacion,
      buffer,
    );
  }

  private base64ToBuffer(base64: string): Buffer | null {
    try {
      const dataUrlMatch = base64.match(/^data:([^;]+);base64,(.+)$/);
      const base64Data = dataUrlMatch ? dataUrlMatch[2] : base64;
      return Buffer.from(base64Data, 'base64');
    } catch {
      return null;
    }
  }
}
