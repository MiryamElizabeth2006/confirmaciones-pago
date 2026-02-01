import { Module } from '@nestjs/common';
import { ComprobantesController } from './comprobantes.controller';

@Module({
  controllers: [ComprobantesController],
})
export class ComprobantesModule {}
