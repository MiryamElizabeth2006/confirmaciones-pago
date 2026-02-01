import { Injectable, Inject } from '@nestjs/common';
import type { ExtraerDatosComprobantePort } from '../../domain/ports/extraer-datos-comprobante.port';
import type { LeerPagosRegistradosPort } from '../../domain/ports/leer-pagos-registrados.port';
import type { PagoRegistrado } from '../../domain/value-objects/pago-registrado.vo';
import type { ResultadoValidacion } from '../../domain/value-objects/resultado-validacion.vo';
import type { Generacion } from '../../domain/constants/generaciones';
import {
  EXTRAER_DATOS_COMPROBANTE_PORT,
  LEER_PAGOS_REGISTRADOS_PORT,
} from '../tokens';

/**
 * Caso de uso: validar un pago.
 * - Estudiante y generación (seleccionados en el front) son solo para registro; no intervienen en la comparación.
 * - Del comprobante (imagen) se extraen: número (Documento o Comprobante), monto, fecha y nombre cuenta destino.
 * - La única comparación es: número extraído + monto contra la columna Documento y Monto del Excel.
 * - Fecha y nombre cuenta destino se devuelven en datosExtraidos solo para registro.
 * - Guarda el comprobante en la base de datos después de validarlo.
 */
@Injectable()
export class ValidarPagoUseCase {
  constructor(
    @Inject(EXTRAER_DATOS_COMPROBANTE_PORT)
    private readonly extraerDatos: ExtraerDatosComprobantePort,
    @Inject(LEER_PAGOS_REGISTRADOS_PORT)
    private readonly leerPagos: LeerPagosRegistradosPort,
    private readonly estudiantesService: EstudiantesService,
  ) {}

  async ejecutar(
    estudiante: string,
    generacion: string,
    imagenBuffer: Buffer,
  ): Promise<ResultadoValidacion> {
    let datosExtraidos;

    try {
      datosExtraidos = await this.extraerDatos.extraer(imagenBuffer);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        valido: false,
        mensaje: 'No se pudo extraer la información del comprobante.',
        error: msg,
      };
    }

    const faltaNumero = !datosExtraidos.numeroTransaccion;
    const faltaMonto = datosExtraidos.monto <= 0;
    if (faltaNumero || faltaMonto) {
      const mensaje =
        faltaNumero && faltaMonto
          ? 'No se encontraron número de documento/comprobante ni monto en el comprobante.'
          : faltaNumero
            ? 'No se encontró el número de documento/comprobante en el comprobante.'
            : 'No se encontró el monto en el comprobante.';
      return {
        valido: false,
        mensaje,
        datosExtraidos: this.datosExtraidosRespuesta(datosExtraidos),
      };
    }

    try {
      const registros = await this.leerPagos.leerTodos();
      const coincidencia = this.buscarCoincidencia(
        registros,
        datosExtraidos.numeroTransaccion,
        datosExtraidos.monto,
      );

      // Obtener el estudiante por nombre
      const estudianteEncontrado = await this.estudiantesService.obtenerPorNombre(estudiante);
      if (!estudianteEncontrado) {
        return {
          valido: false,
          mensaje: 'No se encontró el estudiante en la base de datos.',
          datosExtraidos: this.datosExtraidosRespuesta(datosExtraidos),
        };
      }

      // Convertir la imagen a base64 para guardarla
      const imagenBase64 = `data:image/jpeg;base64,${imagenBuffer.toString('base64')}`;

      // Parsear la fecha del comprobante o usar la fecha actual
      let fechaPago: Date;
      if (datosExtraidos.fecha) {
        try {
          fechaPago = new Date(datosExtraidos.fecha);
          if (isNaN(fechaPago.getTime())) {
            fechaPago = new Date();
          }
        } catch {
          fechaPago = new Date();
        }
      } else {
        fechaPago = new Date();
      }

      // Guardar el comprobante en la base de datos
      try {
        await this.estudiantesService.guardarComprobante({
          estudianteId: estudianteEncontrado.id,
          moduloId: estudianteEncontrado.moduloId,
          urlImagen: imagenBase64,
          numeroTransaccion: datosExtraidos.numeroTransaccion,
          fechaPago: fechaPago,
          monto: datosExtraidos.monto,
          cuentaDestino: datosExtraidos.nombreCuentaDestino,
          documento: datosExtraidos.numeroTransaccion,
        });
        console.log(`[ValidarPagoUseCase] Comprobante guardado para estudiante: ${estudiante}`);
      } catch (error) {
        console.error('Error al guardar comprobante:', error);
        // Continuar aunque falle el guardado
      }

      if (coincidencia) {
        return {
          valido: true,
          mensaje: 'El pago coincide con el registro.',
          datosExtraidos: this.datosExtraidosRespuesta(datosExtraidos),
          coincidenciaExcel: coincidencia,
        };
      }

      return {
        valido: false,
        mensaje:
          'El número de documento/comprobante y/o monto no coinciden con el registro.',
        datosExtraidos: this.datosExtraidosRespuesta(datosExtraidos),
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        valido: false,
        mensaje: 'Error al consultar el registro de pagos.',
        datosExtraidos: this.datosExtraidosRespuesta(datosExtraidos),
        error: msg,
      };
    }
  }

  private datosExtraidosRespuesta(datos: {
    numeroTransaccion: string;
    monto: number;
    fecha?: string;
    nombreCuentaDestino?: string;
  }) {
    return {
      numeroTransaccion: datos.numeroTransaccion,
      monto: datos.monto,
      ...(datos.fecha != null && datos.fecha !== '' && { fecha: datos.fecha }),
      ...(datos.nombreCuentaDestino != null &&
        datos.nombreCuentaDestino !== '' && {
          nombreCuentaDestino: datos.nombreCuentaDestino,
        }),
    };
  }

  /**
   * Comparación solo por columna Documento y Monto del Excel (no por estudiante ni generación).
   */
  private buscarCoincidencia(
    registros: PagoRegistrado[],
    numeroTransaccion: string,
    monto: number,
  ): PagoRegistrado | null {
    return (
      registros.find(
        (p) =>
          this.normalizarTexto(p.numeroTransaccion) ===
            this.normalizarTexto(numeroTransaccion) &&
          Math.abs(Number(p.monto) - monto) < 0.01,
      ) ?? null
    );
  }

  private normalizarTexto(s: string): string {
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
