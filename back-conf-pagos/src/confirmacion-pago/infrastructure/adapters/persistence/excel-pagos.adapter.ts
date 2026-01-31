import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
import type { LeerPagosRegistradosPort } from '../../../domain/ports/leer-pagos-registrados.port';
import type { PagoRegistrado } from '../../../domain/value-objects/pago-registrado.vo';

/**
 * Adaptador (driven): lee el registro de pagos desde un archivo Excel.
 * La comparación se hace con la columna Documento del Excel (número de documento/comprobante).
 * Espera columnas equivalentes a: Estudiante, Generacion, Documento (o Comprobante/NumeroTransaccion), Monto.
 */
@Injectable()
export class ExcelPagosAdapter implements LeerPagosRegistradosPort {
  private readonly rutaExcel: string;

  constructor(private readonly config: ConfigService) {
    this.rutaExcel =
      this.config.get<string>('EXCEL_PAGOS_PATH') ||
      process.cwd() + '/data/pagos.xlsx';
  }

  async leerTodos(): Promise<PagoRegistrado[]> {
    try {
      const workbook = XLSX.readFile(this.rutaExcel, { type: 'file' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        firstSheet,
        { defval: '', raw: false },
      );

      const columnas = this.normalizarColumnas(
        rows.length ? Object.keys(rows[0] as object) : [],
      );
      const mapCol = this.mapearColumnas(columnas);

      return rows
        .map((row) =>
          this.filaARegistro(row as Record<string, unknown>, mapCol),
        )
        .filter((r) => r.estudiante || r.numeroTransaccion);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `No se pudo leer el Excel de pagos (${this.rutaExcel}). ${msg}`,
      );
    }
  }

  private normalizarColumnas(keys: string[]): string[] {
    return keys.map((k) =>
      String(k)
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ')
        .trim(),
    );
  }

  private mapearColumnas(columnas: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    const aliases: Record<string, string[]> = {
      estudiante: ['estudiante', 'nombre', 'nombre del estudiante', 'alumno'],
      generacion: ['generacion', 'generación', 'gen'],
      numeroTransaccion: [
        'documento',
        'numerotransaccion',
        'numero transaccion',
        'numero de transaccion',
        'transaccion',
        'referencia',
        'folio',
        'comprobante',
      ],
      monto: ['monto', 'cantidad', 'importe', 'total'],
    };
    for (const [key, possible] of Object.entries(aliases)) {
      const idx = columnas.findIndex((c) =>
        possible.some((p) => c.includes(p) || p.includes(c)),
      );
      if (idx >= 0) map[key] = idx;
    }
    if (Object.keys(map).length < 4 && columnas.length >= 4) {
      map.estudiante = map.estudiante ?? 0;
      map.generacion = map.generacion ?? 1;
      map.numeroTransaccion = map.numeroTransaccion ?? 2;
      map.monto = map.monto ?? 3;
    }
    return map;
  }

  private filaARegistro(
    row: Record<string, unknown>,
    mapCol: Record<string, number>,
  ): PagoRegistrado {
    const keys = Object.keys(row);
    const get = (k: string) => {
      const idx = mapCol[k];
      const key = idx !== undefined ? keys[idx] : k;
      const val = row[key];
      return val != null ? String(val).trim() : '';
    };
    const montoStr = get('monto').replace(/[^0-9.-]/g, '').replace(',', '.');
    return {
      estudiante: get('estudiante'),
      generacion: get('generacion'),
      numeroTransaccion: get('numeroTransaccion'),
      monto: Number(montoStr) || 0,
    };
  }
}
