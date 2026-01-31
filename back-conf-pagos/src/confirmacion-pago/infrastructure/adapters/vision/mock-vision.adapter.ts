import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExtraerDatosComprobantePort } from '../../../domain/ports/extraer-datos-comprobante.port';
import type { DatosComprobante } from '../../../domain/value-objects/datos-comprobante.vo';

/**
 * Adaptador mock: devuelve datos fijos sin llamar a OpenAI.
 * Útil cuando OPENAI_USE_MOCK=true. Incluye fecha y nombreCuentaDestino para registro.
 */
@Injectable()
export class MockVisionAdapter implements ExtraerDatosComprobantePort {
  private readonly numeroMock: string;
  private readonly montoMock: number;
  private readonly fechaMock: string;
  private readonly nombreCuentaDestinoMock: string;

  constructor(private readonly config: ConfigService) {
    this.numeroMock =
      this.config.get<string>('MOCK_NUMERO_DOCUMENTO') ?? '3314892';
    this.montoMock = Number(this.config.get<string>('MOCK_MONTO')) || 30;
    this.fechaMock =
      this.config.get<string>('MOCK_FECHA') ?? '2025/DIC/02 14H27';
    this.nombreCuentaDestinoMock =
      this.config.get<string>('MOCK_NOMBRE_CUENTA_DESTINO') ?? '';
  }

  async extraer(_imagenBuffer: Buffer): Promise<DatosComprobante> {
    return {
      numeroTransaccion: this.numeroMock,
      monto: this.montoMock,
      fecha: this.fechaMock || undefined,
      nombreCuentaDestino:
        this.nombreCuentaDestinoMock || undefined,
    };
  }
}
