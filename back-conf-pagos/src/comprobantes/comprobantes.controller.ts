import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';

const COMPROBANTES_DIR = path.resolve(process.cwd(), 'data/comprobantes');

/**
 * Sirve las imágenes de comprobantes guardadas (para que el admin pueda verlas).
 */
@Controller('comprobantes')
export class ComprobantesController {
  @Get(':filename')
  async servir(
    @Param('filename') filename: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const safe = path.basename(filename);
    if (!safe || safe !== filename) {
      throw new NotFoundException();
    }
    const filePath = path.join(COMPROBANTES_DIR, safe);
    try {
      await fs.access(filePath);
    } catch {
      throw new NotFoundException('Imagen no encontrada.');
    }
    res.sendFile(filePath);
  }
}
