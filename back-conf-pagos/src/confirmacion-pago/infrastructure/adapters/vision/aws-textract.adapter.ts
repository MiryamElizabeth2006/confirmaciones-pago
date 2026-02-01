import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TextractClient,
  DetectDocumentTextCommand,
  Block,
} from '@aws-sdk/client-textract';
import type { ExtraerDatosComprobantePort } from '../../../domain/ports/extraer-datos-comprobante.port';
import type { DatosComprobante } from '../../../domain/value-objects/datos-comprobante.vo';

/**
 * Adaptador (driven): extrae número de documento/comprobante y monto de una imagen
 * usando AWS Textract (OCR gratuito en free tier). Soporta dos tipos de comprobante Banco Pichincha:
 *
 * Tipo 1 - Recibo físico (depósito): "Documento: 50375023", monto en "Efectivo" o "Total".
 * Tipo 2 - Transferencia digital: "Comprobante: 3314892", monto en "Monto".
 * El valor extraído se compara con la columna Documento del Excel.
 */
@Injectable()
export class AwsTextractAdapter implements ExtraerDatosComprobantePort {
  private readonly client: TextractClient | null = null;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION') ?? 'us-east-1';
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    if (accessKeyId && secretAccessKey) {
      this.client = new TextractClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });
    }
  }

  async extraer(imagenBuffer: Buffer): Promise<DatosComprobante> {
    if (!this.client) {
      throw new Error(
        'Credenciales AWS no configuradas. Define AWS_ACCESS_KEY_ID y AWS_SECRET_ACCESS_KEY (y opcionalmente AWS_REGION).',
      );
    }

    const command = new DetectDocumentTextCommand({
      Document: {
        Bytes: new Uint8Array(imagenBuffer),
      },
    });

    console.log('[AwsTextractAdapter] Iniciando extracción de datos del comprobante...');
    const response = await this.client.send(command);
    const textoCompleto = this.obtenerTextoDeBloques(response.Blocks ?? []);
    console.log('[AwsTextractAdapter] Texto extraído completo (primeros 1000 caracteres):', textoCompleto.substring(0, 1000));
    const resultado = this.parsearComprobante(textoCompleto);
    console.log('[AwsTextractAdapter] Datos extraídos:', {
      numeroTransaccion: resultado.numeroTransaccion || 'NO ENCONTRADO',
      monto: resultado.monto || 0,
      fecha: resultado.fecha || 'NO ENCONTRADA',
      nombreCuentaDestino: resultado.nombreCuentaDestino || 'NO ENCONTRADO',
    });
    return resultado;
  }

  private obtenerTextoDeBloques(blocks: Block[]): string {
    const lineas = blocks
      .filter((b): b is Block & { Text: string } => b.BlockType === 'LINE' && b.Text != null)
      .map((b) => b.Text);
    return lineas.join('\n');
  }

  /**
   * Parsea el texto OCR para extraer numeroTransaccion, monto, fecha y nombreCuentaDestino
   * según formatos Banco Pichincha (Documento / Comprobante, Efectivo/Total/Monto).
   */
  private parsearComprobante(texto: string): DatosComprobante {
    const lineas = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    let numeroTransaccion = '';
    let monto = 0;
    let fecha: string | undefined;
    let nombreCuentaDestino: string | undefined;

    console.log('[AwsTextractAdapter] Texto extraído del OCR:', texto.substring(0, 500));

    // Número de documento: múltiples patrones para mayor flexibilidad
    // Patrón 1: "Documento: 50375023" o "Comprobante: 18354511"
    let docMatch = texto.match(
      /(?:Documento|Comprobante)\s*:?\s*[\r\n]*\s*(\d+)/i,
    );
    
    // Patrón 2: "Número de transacción:" o "Número:" seguido de dígitos
    if (!docMatch) {
      docMatch = texto.match(
        /(?:Número\s+(?:de\s+)?(?:transacción|comprobante|documento)|Número)\s*:?\s*[\r\n]*\s*(\d+)/i,
      );
    }
    
    // Patrón 3: Buscar cualquier secuencia de 6-10 dígitos después de palabras clave
    if (!docMatch) {
      docMatch = texto.match(
        /(?:Transacción|Operación|Referencia)\s*:?\s*[\r\n]*\s*(\d{6,10})/i,
      );
    }
    
    // Patrón 4: Buscar números largos (6-10 dígitos) que puedan ser números de transacción
    // pero solo si están cerca de palabras relacionadas con transacciones
    if (!docMatch) {
      const contextMatch = texto.match(
        /(?:transferencia|pago|depósito|transacción)[\s\S]{0,100}?(\d{6,10})/i,
      );
      if (contextMatch) {
        docMatch = contextMatch;
      }
    }

    if (docMatch) {
      numeroTransaccion = docMatch[1].trim();
      console.log('[AwsTextractAdapter] Número de transacción encontrado:', numeroTransaccion);
    } else {
      console.warn('[AwsTextractAdapter] No se encontró número de transacción en el texto');
    }

    // Monto: después de "Efectivo", "Total" o "Monto" (ej: 287.50, $30.00)
    const montoMatch = texto.match(
      /(?:Efectivo|Total|Monto)\s*:?\s*\$?\s*([\d,]+\.?\d*)/i,
    );
    if (montoMatch) {
      const numStr = montoMatch[1].replace(/,/g, '');
      monto = parseFloat(numStr) || 0;
    }

    // Fecha: patrones como "2025/DIC/02 14H27", "04 dic 2025", "Fecha: ..."
    const fechaMatch = texto.match(
      /(?:Fecha\s*:?\s*)?(\d{4}\/\w{3}\/\d{2}\s*\d*H?\d*|\d{1,2}\s+\w{3}\s+\d{4}|\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/i,
    );
    if (fechaMatch) {
      fecha = fechaMatch[1].trim();
    }

    // Nombre cuenta destino: siempre mostrar si hay valor.
    // - Recibo físico: "Nombre" → titular (KOTKA SOFTWARE DEVELOPMENT S.A, Clear Minds, etc.), NO "Cuenta" (BP-CC 2100318282).
    // - Transferencia digital: "Cuenta destino" / "Beneficiario".
    const esNumeroDeCuenta = (s: string) =>
      /^BP-CC\s*\d/i.test(s) || /^\d[\d\s\-]*\d$/.test(s.trim()) || /^[\d\-\s]+$/.test(s.trim());
    const hastaSiguienteEtiqueta =
      '(?=\\n|$|Documento|Comprobante|Monto|Total|Efectivo|Cuenta\\s|Oficina|Cajero)';
    // 1) Recibo físico: "Nombre" o "Nombre de la cuenta" → valor del titular
    const nombreFisico = texto.match(
      new RegExp(`Nombre(?:\\s+de\\s+la\\s+cuenta)?[^:]*:\\s*([A-Za-z0-9\\s.\\.\\-]+?)${hastaSiguienteEtiqueta}`, 'i'),
    );
    if (nombreFisico) {
      const valor = nombreFisico[1].trim();
      if (valor && !esNumeroDeCuenta(valor)) {
        nombreCuentaDestino = valor;
      }
    }
    // 1b) Fallback: "Nombre" solo en una línea y el valor en la siguiente
    if (!nombreCuentaDestino && lineas.length > 0) {
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i];
        if (/^Nombre\s*:?\s*$/i.test(linea) && lineas[i + 1]) {
          const valor = lineas[i + 1].trim();
          if (valor && !esNumeroDeCuenta(valor) && /[A-Za-z]/.test(valor)) {
            nombreCuentaDestino = valor;
            break;
          }
        }
        const enLinea = linea.match(/^Nombre\s*:?\s*(.+)/i);
        if (enLinea) {
          const valor = enLinea[1].trim();
          if (valor && !esNumeroDeCuenta(valor)) {
            nombreCuentaDestino = valor;
            break;
          }
        }
      }
    }
    // 2) Transferencia digital: "Cuenta destino" / "Beneficiario"
    if (!nombreCuentaDestino) {
      const nombreDigital = texto.match(
        /(?:Cuenta\s*destino|Beneficiario)[^:]*:\s*([A-Za-z0-9\s\.\-]+?)(?=\n|$|Documento|Comprobante|Monto|Total|Efectivo)/i,
      );
      if (nombreDigital) {
        const valor = nombreDigital[1].trim();
        if (valor && !esNumeroDeCuenta(valor)) {
          nombreCuentaDestino = valor;
        }
      }
    }

    return {
      numeroTransaccion,
      monto,
      ...(fecha && { fecha }),
      ...(nombreCuentaDestino && { nombreCuentaDestino }),
    };
  }
}
