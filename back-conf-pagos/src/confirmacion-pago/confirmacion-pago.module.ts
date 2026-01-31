import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfirmacionPagoController } from './infrastructure/web/confirmacion-pago.controller';
import { ValidarPagoUseCase } from './application/use-cases/validar-pago.use-case';
import { ObtenerOpcionesSelectUseCase } from './application/use-cases/obtener-opciones-select.use-case';
import { AwsTextractAdapter } from './infrastructure/adapters/vision/aws-textract.adapter';
import { OpenAIVisionAdapter } from './infrastructure/adapters/vision/openai-vision.adapter';
import { MockVisionAdapter } from './infrastructure/adapters/vision/mock-vision.adapter';
import { ExcelPagosAdapter } from './infrastructure/adapters/persistence/excel-pagos.adapter';
import {
  EXTRAER_DATOS_COMPROBANTE_PORT,
  LEER_PAGOS_REGISTRADOS_PORT,
} from './application/tokens';

@Module({
  imports: [ConfigModule],
  controllers: [ConfirmacionPagoController],
  providers: [
    ValidarPagoUseCase,
    ObtenerOpcionesSelectUseCase,
    AwsTextractAdapter,
    OpenAIVisionAdapter,
    MockVisionAdapter,
    ExcelPagosAdapter,
    {
      provide: EXTRAER_DATOS_COMPROBANTE_PORT,
      useFactory: (
        config: ConfigService,
        textract: AwsTextractAdapter,
        openai: OpenAIVisionAdapter,
        mock: MockVisionAdapter,
      ) => {
        const provider = config.get<string>('VISION_PROVIDER') ?? 'textract';
        if (config.get<string>('OPENAI_USE_MOCK') === 'true' || provider === 'mock') return mock;
        if (provider === 'openai') return openai;
        return textract;
      },
      inject: [ConfigService, AwsTextractAdapter, OpenAIVisionAdapter, MockVisionAdapter],
    },
    {
      provide: LEER_PAGOS_REGISTRADOS_PORT,
      useExisting: ExcelPagosAdapter,
    },
  ],
})
export class ConfirmacionPagoModule {}
