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
import { ObtenerOpcionesSelectUseCase } from '../../application/use-cases/obtener-opciones-select.use-case';
import { GENERACIONES, type Generacion } from '../../domain/constants/generaciones';
import { EstudiantesService } from '../../../estudiantes/estudiantes.service';

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
    private readonly obtenerOpcionesSelectUseCase: ObtenerOpcionesSelectUseCase,
    private readonly estudiantesService: EstudiantesService,
  ) {}

  @Get('opciones')
  async opciones() {
    // Obtener estudiantes y módulos desde Prisma
    const nombresEstudiantes = await this.estudiantesService.obtenerNombres();
    const modulos = await this.estudiantesService.obtenerModulos();
    
    return {
      estudiantes: nombresEstudiantes,
      modulos: modulos.map((m) => m.nombre), // Solo devolver los nombres de los módulos
      generaciones: GENERACIONES, // Mantener para compatibilidad
    };
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
    @Body() body: { estudiante?: string; generacion?: string; modulo?: string },
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('Debe enviar la imagen del comprobante.');
    }

    const estudiante = (body.estudiante ?? '').trim();
    const modulo = (body.modulo ?? '').trim();
    let generacion = (body.generacion ?? '').trim() as Generacion;

    if (!estudiante) {
      throw new BadRequestException('El nombre del estudiante es requerido.');
    }

    // Si se envía módulo, obtener la generación del estudiante desde la BD
    if (modulo && !generacion) {
      const estudianteEncontrado = await this.estudiantesService.obtenerPorNombre(estudiante);
      if (estudianteEncontrado) {
        generacion = estudianteEncontrado.generacion as Generacion;
      }
    }

    // Si no hay generación válida, obtenerla del estudiante desde la BD
    if (!generacion || !GENERACIONES.includes(generacion)) {
      const estudianteEncontrado = await this.estudiantesService.obtenerPorNombre(estudiante);
      if (estudianteEncontrado) {
        generacion = estudianteEncontrado.generacion as Generacion;
      } else {
        throw new BadRequestException(
          'No se pudo determinar la generación del estudiante.',
        );
      }
    }

    return this.validarPagoUseCase.ejecutar(
      estudiante,
      generacion,
      file.buffer,
    );
  }

  /**
   * POST /confirmacion-pago/validar-json
   * Alternativa para probar desde Insomnia con JSON: la imagen se envía en base64.
   * Body (application/json):
   * { "estudiante": "...", "generacion": "generacion 1", "comprobanteBase64": "data:image/jpeg;base64,..." o solo "...base64..." }
   */
  @Post('validar-json')
  async validarJson(
    @Body()
    body: {
      estudiante?: string;
      generacion?: string;
      comprobanteBase64?: string;
    },
  ) {
    const estudiante = (body.estudiante ?? '').trim();
    const generacion = (body.generacion ?? '').trim() as Generacion;
    const comprobanteBase64 = (body.comprobanteBase64 ?? '').trim();

    if (!estudiante) {
      throw new BadRequestException('El nombre del estudiante es requerido.');
    }

    if (!GENERACIONES.includes(generacion)) {
      throw new BadRequestException(
        'La generación debe ser entre generacion 1 y generacion 5.',
      );
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

    return this.validarPagoUseCase.ejecutar(estudiante, generacion, buffer);
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
