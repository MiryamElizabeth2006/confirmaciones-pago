import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import type { ExtraerDatosComprobantePort } from '../../../domain/ports/extraer-datos-comprobante.port';
import type { DatosComprobante } from '../../../domain/value-objects/datos-comprobante.vo';

/**
 * Adaptador (driven): extrae número de documento/comprobante y monto de una imagen
 * usando OpenAI Vision (IA). Soporta dos tipos de comprobante Banco Pichincha:
 *
 * Tipo 1 - Recibo físico (depósito): "Documento: 50375023", monto en "Efectivo" o "Total" (ej: 287.50).
 * Tipo 2 - Transferencia digital: "Comprobante: 3314892", monto en "Monto" (ej: $30.00).
 * El valor extraído se compara con la columna Documento del Excel.
 */
@Injectable()
export class OpenAIVisionAdapter implements ExtraerDatosComprobantePort {
  private readonly openai: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async extraer(imagenBuffer: Buffer): Promise<DatosComprobante> {
    if (!this.openai) {
      throw new Error(
        'OPENAI_API_KEY no está configurada. Define la variable de entorno OPENAI_API_KEY.',
      );
    }

    const base64 = imagenBuffer.toString('base64');
    const mimeType = 'image/jpeg';

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Eres un asistente que analiza comprobantes de pago de Banco Pichincha (y similares). La imagen puede ser de DOS TIPOS:

**Tipo 1 - Recibo físico de depósito:** tiene "Documento:" (número), "Efectivo" o "Total" (monto), "Fecha" (fecha/hora), y nombre del destinatario o cuenta (ej: "Nombre...: KOTKA SOFTWARE...").

**Tipo 2 - Transferencia digital:** tiene "Comprobante:" (número), "Monto" (ej: $ 30.00), "Fecha", y "Cuenta destino" con nombre (ej: "Ruiz Guilcarema Fann...").

Extrae estos cuatro datos en un JSON válido (solo el JSON, sin comentarios):

1. **numeroTransaccion**: Número junto a "Documento" (físico) O junto a "Comprobante" (digital). String, sin espacios. Ej: "50375023" o "3314892".
2. **monto**: Monto del pago en número (sin $). Ej: 287.5 o 30.
3. **fecha**: Extrae SOLO lo que aparece en la imagen. En comprobantes digitales suele aparecer solo la fecha sin hora (ej: "04 dic 2025"). En recibos físicos puede aparecer fecha y hora (ej: "2025/DIC/02 14H27"). No inventes la hora si no está visible. Si solo ves fecha, devuelve solo la fecha. Si no hay, "".
4. **nombreCuentaDestino**: Nombre del beneficiario o cuenta destino (ej: "KOTKA SOFTWARE DEVELOPMENT S.A" o "Ruiz Guilcarema Fann..."). String. Si no hay, "".

Ejemplo: {"numeroTransaccion":"50375023","monto":287.5,"fecha":"2025/DIC/02 14H27","nombreCuentaDestino":"KOTKA SOFTWARE DEVELOPMENT S.A"}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('La IA no devolvió contenido para la imagen.');
    }

    const parsed = this.parseJsonRespuesta(content);
    return {
      numeroTransaccion: String(parsed.numeroTransaccion ?? '').trim(),
      monto: Number(parsed.monto) || 0,
      fecha: parsed.fecha != null ? String(parsed.fecha).trim() : undefined,
      nombreCuentaDestino:
        parsed.nombreCuentaDestino != null
          ? String(parsed.nombreCuentaDestino).trim()
          : undefined,
    };
  }

  private parseJsonRespuesta(content: string): {
    numeroTransaccion?: string;
    monto?: number;
    fecha?: string;
    nombreCuentaDestino?: string;
  } {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;
    try {
      return JSON.parse(jsonStr);
    } catch {
      throw new Error(
        `No se pudo interpretar la respuesta de la IA: ${content}`,
      );
    }
  }
}
